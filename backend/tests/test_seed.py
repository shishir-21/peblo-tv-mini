import json

from PIL import Image
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app import seed
from app.models import Artwork, Episode
from app.models.base import Base
from app.services.validation import validate_content


class RecordingStorage:
    def __init__(self):
        self.saved_assets = []

    def save(self, file_path, storage_key, resource_type="image"):
        with Image.open(file_path) as image:
            self.saved_assets.append((storage_key, resource_type, image.size))
        return storage_key


def test_project_dir_resolves_seed_data_from_container_workdir(tmp_path):
    project_dir = tmp_path / "app"
    module_file = project_dir / "app" / "seed.py"
    seed_file = project_dir / "seed_data" / "seed_shows.json"
    seed_file.parent.mkdir(parents=True)
    seed_file.write_text("[]")

    assert seed._find_project_dir(module_file) == project_dir


def test_all_published_seed_records_declare_required_artwork():
    required_artwork = {"poster", "banner", "thumbnail"}

    for record in seed.load_seed_data():
        if record["status"] == "published":
            assert set(record["artwork_available"]) == required_artwork


def test_seed_creates_and_backfills_required_published_artwork(tmp_path, monkeypatch):
    seed_file = tmp_path / "seed.json"
    seed_file.write_text(json.dumps([{
        "episode_id": "seed-episode-1",
        "show_title": "Seed Show",
        "slug": "seed-show",
        "section": "featured",
        "categories": ["adventure"],
        "synopsis": "A valid seed episode.",
        "season_number": 1,
        "episode_number": 1,
        "episode_title": "Pilot",
        "duration_seconds": 120,
        "language": "en",
        "content_group": "seed-show-s01e01",
        "status": "published",
        "artwork_available": ["poster", "banner", "thumbnail"],
    }]))
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine)
    storage = RecordingStorage()

    monkeypatch.setattr(seed, "SEED_FILE", seed_file)
    monkeypatch.setattr(seed, "STORAGE_DIR", tmp_path / "storage")
    monkeypatch.setattr(seed, "SessionLocal", session_factory)
    monkeypatch.setattr(seed, "media_storage", storage)

    seed.seed_database()
    # Existing episodes are normally skipped; reseeding must still backfill artwork.
    seed.seed_database()

    with session_factory() as session:
        episode = session.scalar(select(Episode).where(Episode.episode_id == "seed-episode-1"))
        artworks = session.scalars(
            select(Artwork).where(Artwork.episode_id == episode.id)
        ).all()

        assert {artwork.artwork_type for artwork in artworks} == {
            "poster", "banner", "thumbnail"
        }
        assert all(0 < artwork.size_bytes <= 200 * 1024 for artwork in artworks)
        assert validate_content(session)["valid"] is True

    assert storage.saved_assets == [
        ("artwork/seed-episode-1/poster.jpg", "image", (600, 900)),
        ("artwork/seed-episode-1/banner.jpg", "image", (1280, 720)),
        ("artwork/seed-episode-1/thumbnail.jpg", "image", (640, 360)),
    ]
