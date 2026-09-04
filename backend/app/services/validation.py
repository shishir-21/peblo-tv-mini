from collections import defaultdict
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from typing import Dict, Any, List

from app.models import Show, Season, Episode, Artwork


def validate_content(db: Session) -> Dict[str, Any]:
    errors = []
    warnings = []
    
    # We validate all "published" shows/episodes, or perhaps all content.
    # The requirement says "Publishing must fail when blocking errors exist".
    # We will check all episodes with status="published".
    
    episodes = db.scalars(
        select(Episode)
        .options(
            joinedload(Episode.season).joinedload(Season.show),
            joinedload(Episode.artworks)
        )
        .where(Episode.status == "published")
    ).unique().all()
    
    allowed_sections = {"featured", "series", "minisodes", "songs"}
    allowed_categories = {
        "adventure", "folk", "friendship", "india", "language", "learning",
        "maths", "music", "nature", "reading", "science", "singalong",
        "stories", "travel", "values"
    }
    allowed_languages = {"en", "hi"}
    
    content_group_languages = defaultdict(list)
    
    for ep in episodes:
        show = ep.season.show
        season = ep.season
        
        # Show Validation
        if show.section and show.section not in allowed_sections:
            errors.append({
                "code": "INVALID_SECTION",
                "message": f"Show has invalid section: {show.section}",
                "show_id": str(show.id)
            })
            
        # Category Validation
        for cat in show.categories:
            if cat.name not in allowed_categories:
                errors.append({
                    "code": "INVALID_CATEGORY",
                    "message": f"Show has invalid category: {cat.name}",
                    "show_id": str(show.id)
                })
        
        # Language Validation
        if ep.language not in allowed_languages:
            errors.append({
                "code": "INVALID_LANGUAGE",
                "message": f"Episode has invalid language: {ep.language}",
                "episode_id": str(ep.id)
            })
            
        # Missing fields
        if not ep.title:
            errors.append({
                "code": "MISSING_TITLE",
                "message": "Published episode is missing title",
                "episode_id": str(ep.id)
            })
        if not show.title:
            errors.append({
                "code": "MISSING_TITLE",
                "message": "Show is missing title",
                "show_id": str(show.id)
            })
            
        # Duration
        if not ep.duration_seconds or ep.duration_seconds <= 0:
            errors.append({
                "code": "MISSING_DURATION",
                "message": "Published episode is missing duration",
                "episode_id": str(ep.id)
            })
            
        # Season 0 trailer convention
        if season.season_number == 0:
            if ep.title.lower() != "trailer":
                errors.append({
                    "code": "SEASON_0_NOT_TRAILER",
                    "message": "Season 0 is reserved for trailers. Title must be 'Trailer'",
                    "episode_id": str(ep.id)
                })
                
        # Duplicate language variant
        key = (show.id, ep.content_group, ep.language)
        content_group_languages[key].append(ep.id)
        
        # Artwork Validation
        artwork_dict = {aw.artwork_type: aw for aw in ep.artworks}
        required_artworks = {
            "poster": {"width": 600, "height": 900, "max_size": 200 * 1024},
            "banner": {"width": 1280, "height": 720, "max_size": 200 * 1024},
            "thumbnail": {"width": 640, "height": 360, "max_size": 200 * 1024}
        }
        
        for aw_type, rules in required_artworks.items():
            if aw_type not in artwork_dict:
                errors.append({
                    "code": "MISSING_ARTWORK",
                    "message": f"Published episode is missing {aw_type} artwork",
                    "episode_id": str(ep.id)
                })
            else:
                aw = artwork_dict[aw_type]
                if aw.width != rules["width"] or aw.height != rules["height"]:
                    errors.append({
                        "code": "INVALID_ARTWORK_DIMENSIONS",
                        "message": f"{aw_type} artwork must be {rules['width']}x{rules['height']}",
                        "episode_id": str(ep.id)
                    })
                if aw.size_bytes > rules["max_size"]:
                    errors.append({
                        "code": "INVALID_ARTWORK_SIZE",
                        "message": f"{aw_type} artwork exceeds 200KB",
                        "episode_id": str(ep.id)
                    })
                    
    # Check duplicates
    for key, ep_ids in content_group_languages.items():
        if len(ep_ids) > 1:
            errors.append({
                "code": "DUPLICATE_LANGUAGE_VARIANT",
                "message": f"Multiple episodes found for same content_group and language",
                "show_id": str(key[0]),
                "content_group": key[1]
            })
            
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }
