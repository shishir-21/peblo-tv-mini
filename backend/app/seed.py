import json
from pathlib import Path

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Category, Episode, Season, Show


BASE_DIR = Path(__file__).resolve().parents[2]
SEED_FILE = BASE_DIR / "seed_data" / "seed_shows.json"


def load_seed_data():
    with open(SEED_FILE, encoding="utf-8") as file:
        return json.load(file)


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

                    continue

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

                # Mark this variant as seen so another record
                # with the same content_group + language is skipped.
                seen_variants.add(variant_key)

                created += 1

            # -------------------------------------------------
            # Commit everything as one transaction
            # -------------------------------------------------

            session.commit()

            print()
            print("Seed completed successfully.")
            print(f"Input records: {len(records)}")
            print(f"Episodes created: {created}")
            print(f"Episodes skipped: {skipped}")
            print(f"Shows processed: {len(shows)}")
            print(f"Categories processed: {len(categories)}")
            print(f"Seasons processed: {len(seasons)}")

        except Exception:
            session.rollback()
            raise


if __name__ == "__main__":
    seed_database()
    