from collections import defaultdict
import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Episode, Season


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


def write_catalogue(
    catalogue: dict,
    output_path: Path,
) -> None:
    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    temporary_path = output_path.with_suffix(".tmp")

    with open(
        temporary_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            catalogue,
            file,
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
        )

    temporary_path.replace(output_path)
    
