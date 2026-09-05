import hashlib
import json
from pathlib import Path

from PIL import Image
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Artwork, Category, Episode, Season, Show
from app.services.artwork import ARTWORK_SPECS, validate_artwork
from app.storage import storage as media_storage


def _find_project_dir(module_file: Path) -> Path:
    """Find the project directory that contains the seed data."""
    for directory in module_file.resolve().parents:
        if (directory / "seed_data" / "seed_shows.json").is_file():
            return directory

    # In the container, ``/app`` is the project directory even before the
    # seed file is opened, so retain that useful path in an error message.
    return module_file.resolve().parents[1]


BASE_DIR = _find_project_dir(Path(__file__))
SEED_FILE = BASE_DIR / "seed_data" / "seed_shows.json"
STORAGE_DIR = BASE_DIR / "storage"


def load_seed_data():
    with open(SEED_FILE, encoding="utf-8") as file:
        return json.load(file)


def _seed_artwork_colour(episode_id: str) -> tuple[int, int, int]:
    """Return a stable, non-empty placeholder colour for demo artwork."""
    return tuple(hashlib.sha256(episode_id.encode("utf-8")).digest()[:3])


def _create_seed_artwork_file(
    episode: Episode,
    artwork_type: str,
) -> Path:
    spec = ARTWORK_SPECS[artwork_type]
    temporary_path = STORAGE_DIR / "_tmp" / (
        f"seed-{episode.episode_id}-{artwork_type}.jpg"
    )
    temporary_path.parent.mkdir(parents=True, exist_ok=True)

    image = Image.new(
        "RGB",
        (spec["width"], spec["height"]),
        _seed_artwork_colour(episode.episode_id),
    )
    image.save(temporary_path, format="JPEG", quality=85, optimize=True)

    # Keep generated seed assets subject to the same rules as CMS uploads.
    validate_artwork(artwork_type, temporary_path.read_bytes())
    return temporary_path


def ensure_published_seed_artwork(session, episode: Episode) -> int:
    """Create missing required artwork rows and files for a published seed episode."""
    created = 0

    for artwork_type, spec in ARTWORK_SPECS.items():
        existing_artwork = session.scalar(
            select(Artwork).where(
                Artwork.episode_id == episode.id,
                Artwork.artwork_type == artwork_type,
            )
        )
        if existing_artwork is not None:
            continue

        temporary_path = _create_seed_artwork_file(episode, artwork_type)
        storage_key = f"artwork/{episode.episode_id}/{artwork_type}.jpg"
        size_bytes = temporary_path.stat().st_size
        try:
            media_storage.save(temporary_path, storage_key, resource_type="image")
        finally:
            temporary_path.unlink(missing_ok=True)

        session.add(
            Artwork(
                episode_id=episode.id,
                artwork_type=artwork_type,
                storage_key=storage_key,
                width=spec["width"],
                height=spec["height"],
                size_bytes=size_bytes,
            )
        )
        created += 1

    return created


def seed_database():
    records = load_seed_data()

    with SessionLocal() as session:
        try:
            shows = {}
            seasons = {}
            categories = {}

            # -------------------------------------------------
            # Create shows
            # -------------------------------------------------

            for record in records:
                slug = record["slug"]

                if slug not in shows:
                    show = session.scalar(
                        select(Show).where(Show.slug == slug)
                    )

                    if show is None:
                        show = Show(
                            title=record["show_title"],
                            slug=slug,
                            section=record["section"],
                            synopsis=record["synopsis"],
                            status=record["status"],
                        )

                        session.add(show)
                        session.flush()

                    shows[slug] = show

            # -------------------------------------------------
            # Create categories
            # -------------------------------------------------

            for record in records:
                show = shows[record["slug"]]

                for category_name in record["categories"]:
                    if category_name not in categories:
                        category = session.scalar(
                            select(Category).where(
                                Category.name == category_name
                            )
                        )

                        if category is None:
                            category = Category(
                                name=category_name
                            )

                            session.add(category)
                            session.flush()

                        categories[category_name] = category

                    category = categories[category_name]

                    if category not in show.categories:
                        show.categories.append(category)

            # -------------------------------------------------
            # Create seasons
            # -------------------------------------------------

            for record in records:
                show = shows[record["slug"]]

                key = (
                    record["slug"],
                    record["season_number"],
                )

                if key not in seasons:
                    season = session.scalar(
                        select(Season).where(
                            Season.show_id == show.id,
                            Season.season_number
                            == record["season_number"],
                        )
                    )

                    if season is None:
                        season = Season(
                            show_id=show.id,
                            season_number=record["season_number"],
                        )

                        session.add(season)
                        session.flush()

                    seasons[key] = season

            # -------------------------------------------------
            # Create episodes
            # -------------------------------------------------

            created = 0
            skipped = 0
            artworks_created = 0

            # Keep track of variants that we have already
            # encountered during this seed operation.
            seen_variants = set()

            for record in records:
                season = seasons[
                    (
                        record["slug"],
                        record["season_number"],
                    )
                ]

                episode_id = record["episode_id"]
                content_group = record["content_group"]
                language = record["language"]

                variant_key = (
                    content_group,
                    language,
                )

                # -------------------------------------------------
                # Check 1: episode_id already exists in database
                # -------------------------------------------------

                existing_episode = session.scalar(
                    select(Episode).where(
                        Episode.episode_id == episode_id
                    )
                )

                if existing_episode is not None:
                    skipped += 1

                    print(
                        f"Skipping existing episode: {episode_id}"
                    )

                    episode = existing_episode
                else:
                    # -------------------------------------------------
                    # Check 2: duplicate variant in current seed data
                    # -------------------------------------------------

                    if variant_key in seen_variants:
                        skipped += 1

                        print(
                            "Skipping duplicate variant: "
                            f"{episode_id} -> "
                            f"({content_group}, {language})"
                        )

                        continue

                    # -------------------------------------------------
                    # Check 3: duplicate variant already in database
                    # -------------------------------------------------

                    existing_variant = session.scalar(
                        select(Episode).where(
                            Episode.content_group == content_group,
                            Episode.language == language,
                        )
                    )

                    if existing_variant is not None:
                        skipped += 1

                        print(
                            "Skipping existing variant: "
                            f"{episode_id} -> "
                            f"({content_group}, {language})"
                        )

                        continue

                    # -------------------------------------------------
                    # Create episode
                    # -------------------------------------------------

                    episode = Episode(
                        episode_id=episode_id,
                        season_id=season.id,
                        episode_number=record["episode_number"],
                        title=record["episode_title"],
                        synopsis=record["synopsis"],
                        duration_seconds=record["duration_seconds"],
                        language=language,
                        content_group=content_group,
                        status=record["status"],
                    )

                    session.add(episode)
                    session.flush()

                    # Mark this variant as seen so another record
                    # with the same content_group + language is skipped.
                    seen_variants.add(variant_key)

                    created += 1

                if episode.status == "published":
                    artworks_created += ensure_published_seed_artwork(
                        session, episode
                    )

            # -------------------------------------------------
            # Commit everything as one transaction
            # -------------------------------------------------

            session.commit()

            print()
            print("Seed completed successfully.")
            print(f"Input records: {len(records)}")
            print(f"Episodes created: {created}")
            print(f"Episodes skipped: {skipped}")
            print(f"Artwork files created: {artworks_created}")
            print(f"Shows processed: {len(shows)}")
            print(f"Categories processed: {len(categories)}")
            print(f"Seasons processed: {len(seasons)}")

        except Exception:
            session.rollback()
            raise


if __name__ == "__main__":
    seed_database()
