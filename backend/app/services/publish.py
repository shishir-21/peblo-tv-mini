from collections import defaultdict
from datetime import datetime, timezone
import hashlib
import json
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Episode, PublishRun, Season
from app.services.validation import validate_content
from app.storage import storage as media_storage

BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"

def validate_catalogue(catalogue: dict) -> None:
    allowed_sections = {
        "featured",
        "series",
        "minisodes",
        "songs",
    }

    sections = catalogue.get("sections", {})

    for section in sections:
        if section not in allowed_sections:
            raise ValueError(
                f"Invalid catalogue section: {section}"
            )

    for section_entries in sections.values():
        for entry in section_entries:
            if not entry["show_title"]:
                raise ValueError(
                    "Catalogue entry is missing show title"
                )

            if not entry["slug"]:
                raise ValueError(
                    "Catalogue entry is missing show slug"
                )

            if not entry["content_group"]:
                raise ValueError(
                    "Catalogue entry is missing content group"
                )

            if not entry["languages"]:
                raise ValueError(
                    f"Catalogue entry {entry['content_group']} "
                    "has no languages"
                )

            if entry["season_number"] == 0:
                if entry["episode_title"].lower() != "trailer":
                    raise ValueError(
                        "Season 0 is reserved for trailers"
                    )

def serialize_catalogue(catalogue: dict) -> bytes:
    return json.dumps(
        catalogue,
        ensure_ascii=False,
        indent=2,
        sort_keys=True,
    ).encode("utf-8")

def calculate_catalogue_hash(catalogue: dict) -> str:
    catalogue_bytes = serialize_catalogue(catalogue)

    return hashlib.sha256(
        catalogue_bytes
    ).hexdigest()

def persist_catalogue(catalogue: dict, storage_key: str) -> None:
    catalogue_bytes = serialize_catalogue(catalogue)
    temporary_path = STORAGE_DIR / "_tmp" / f"{uuid.uuid4()}.json"
    temporary_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path.write_bytes(catalogue_bytes)
    
    try:
        media_storage.save(temporary_path, storage_key, resource_type="raw")
    finally:
        temporary_path.unlink(missing_ok=True)


def create_publish_run(
    db: Session,
    triggered_by: uuid.UUID | None = None,
) -> PublishRun:
    publish_run = PublishRun(
        triggered_by=triggered_by,
        status="running",
    )

    db.add(publish_run)
    db.commit()
    db.refresh(publish_run)

    return publish_run


def build_catalogue(db: Session) -> dict:
    episodes = db.scalars(
        select(Episode)
        .options(
            joinedload(Episode.season).joinedload(Season.show),
            joinedload(Episode.artworks),
        )
        .where(Episode.status == "published")
        .order_by(
            Episode.season_id,
            Episode.episode_number,
            Episode.language,
        )
    ).unique().all()

    sections = defaultdict(list)
    grouped_episodes = {}

    for episode in episodes:
        show = episode.season.show

        group_key = (
            show.slug,
            episode.content_group,
        )

        if group_key not in grouped_episodes:
            grouped_episodes[group_key] = {
                "show_title": show.title,
                "slug": show.slug,
                "section": show.section,
                "season_number": episode.season.season_number,
                "episode_number": episode.episode_number,
                "episode_title": episode.title,
                "synopsis": episode.synopsis,
                "duration_seconds": episode.duration_seconds,
                "content_group": episode.content_group,
                "languages": [],
                "artwork": {},
            }

        entry = grouped_episodes[group_key]

        if episode.language not in entry["languages"]:
            entry["languages"].append(episode.language)

        for artwork in episode.artworks:
            entry["artwork"][artwork.artwork_type] = {
                "storage_key": artwork.storage_key,
                "url": media_storage.get_url(artwork.storage_key),
                "width": artwork.width,
                "height": artwork.height,
            }

    for entry in grouped_episodes.values():
        entry["languages"].sort()

        section = entry["section"] or "series"
        sections[section].append(entry)

    for section_entries in sections.values():
        section_entries.sort(
            key=lambda item: (
                item["show_title"],
                item["season_number"],
                item["episode_number"],
                item["content_group"],
            )
        )

    return {
        "sections": dict(
            sorted(sections.items())
        )
    }


import uuid

def execute_publish(
    db: Session,
    triggered_by: uuid.UUID | None = None,
) -> PublishRun:
    publish_run = create_publish_run(
        db=db,
        triggered_by=triggered_by,
    )

    try:
        report = validate_content(db)
        if not report["valid"]:
            error_codes = [err["code"] for err in report["errors"]]
            raise ValueError(f"Content validation failed with errors: {error_codes}")

        catalogue = build_catalogue(db)

        validate_catalogue(catalogue)

        catalogue_hash = calculate_catalogue_hash(catalogue)

        latest_run = db.scalar(
            select(PublishRun)
            .where(PublishRun.status == "completed")
            .order_by(PublishRun.completed_at.desc())
            .limit(1)
        )

        entries = [
            entry
            for section_entries in catalogue["sections"].values()
            for entry in section_entries
        ]

        shows_count = len({
            entry["slug"]
            for entry in entries
        })

        episodes_count = len(entries)

        if latest_run and latest_run.catalogue_hash == catalogue_hash:
            publish_run.status = "completed"
            publish_run.completed_at = datetime.now(timezone.utc)
            publish_run.shows_count = shows_count
            publish_run.episodes_count = episodes_count
            publish_run.catalogue_hash = catalogue_hash
            
            db.commit()
            db.refresh(publish_run)
            return publish_run

        persist_catalogue(
            catalogue=catalogue,
            storage_key="catalogue.json",
        )
        
        persist_catalogue(
            catalogue=catalogue,
            storage_key=f"catalogues/catalogue-{publish_run.id}.json",
        )

        publish_run.status = "completed"
        publish_run.completed_at = datetime.now(timezone.utc)
        publish_run.shows_count = shows_count
        publish_run.episodes_count = episodes_count
        publish_run.catalogue_hash = catalogue_hash

        db.commit()
        db.refresh(publish_run)

        return publish_run

    except Exception as exc:
        publish_run.status = "failed"
        publish_run.completed_at = datetime.now(timezone.utc)
        publish_run.error_message = str(exc)

        db.commit()
        db.refresh(publish_run)

        raise
    