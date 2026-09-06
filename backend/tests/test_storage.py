import pytest
from app.storage.local import LocalStorage
from app.storage.cloudinary import CloudinaryStorage
from app.storage.base import StorageError
import cloudinary
import importlib

def test_local_storage(tmp_path):
    storage = LocalStorage(tmp_path)
    file_path = tmp_path / "test.txt"
    file_path.write_text("hello")
    
    key = storage.save(file_path, "docs/test.txt", resource_type="raw")
    assert key == "docs/test.txt"
    
    assert storage.exists("docs/test.txt")
    assert storage.get_path("docs/test.txt") == tmp_path / "docs/test.txt"
    assert storage.get_url("docs/test.txt", resource_type="raw") == "/storage/docs/test.txt"

def test_cloudinary_storage_initialization():
    storage = CloudinaryStorage(
        cloud_name="test_cloud",
        api_key="test_key",
        api_secret="test_secret"
    )
    assert storage is not None

def test_cloudinary_public_id_generation():
    storage = CloudinaryStorage(
        cloud_name="test_cloud",
        api_key="test_key",
        api_secret="test_secret"
    )
    # Image key removes extension
    img_id = storage._get_public_id("artwork/ep_0001/poster.jpg", resource_type="image")
    assert img_id == "peblo-tv/artwork/ep_0001/poster"
    
    # Raw key preserves extension
    raw_id = storage._get_public_id("catalogue.json", resource_type="raw")
    assert raw_id == "peblo-tv/catalogue.json"


def test_cloudinary_image_upload_and_url_use_image_resource_type(tmp_path, monkeypatch):
    storage = CloudinaryStorage("test_cloud", "test_key", "test_secret")
    image_path = tmp_path / "poster.jpg"
    image_path.write_bytes(b"image")
    upload_calls = []

    monkeypatch.setattr(
        "app.storage.cloudinary.cloudinary.uploader.upload",
        lambda path, **kwargs: upload_calls.append((path, kwargs)),
    )

    storage.save(image_path, "artwork/episode-1/poster.jpg")

    assert upload_calls == [(str(image_path), {
        "public_id": "peblo-tv/artwork/episode-1/poster",
        "resource_type": "image",
        "overwrite": True,
        "invalidate": True,
    })]
    assert "/image/upload/" in storage.get_url("artwork/episode-1/poster.jpg")
    assert storage.get_url("artwork/episode-1/poster.jpg").endswith(
        "/peblo-tv/artwork/episode-1/poster"
    )


def test_cloudinary_raw_catalogue_upload_and_url_preserve_json_extension(tmp_path, monkeypatch):
    storage = CloudinaryStorage("test_cloud", "test_key", "test_secret")
    catalogue_path = tmp_path / "catalogue.json"
    catalogue_path.write_text("{}")
    upload_calls = []

    monkeypatch.setattr(
        "app.storage.cloudinary.cloudinary.uploader.upload",
        lambda path, **kwargs: upload_calls.append((path, kwargs)),
    )

    storage.save(catalogue_path, "catalogue.json", resource_type="raw")

    assert upload_calls == [(str(catalogue_path), {
        "public_id": "peblo-tv/catalogue.json",
        "resource_type": "raw",
        "overwrite": True,
        "invalidate": True,
    })]
    url = storage.get_url("catalogue.json", resource_type="raw")
    assert "/raw/upload/" in url
    assert url.endswith("/peblo-tv/catalogue.json")


def test_cloudinary_raw_exists_uses_raw_resource_type(monkeypatch):
    storage = CloudinaryStorage("test_cloud", "test_key", "test_secret")
    resource_calls = []

    monkeypatch.setattr(
        "app.storage.cloudinary.cloudinary.api.resource",
        lambda public_id, **kwargs: resource_calls.append((public_id, kwargs)),
    )

    assert storage.exists("catalogue.json", resource_type="raw") is True
    assert resource_calls == [(
        "peblo-tv/catalogue.json", {"resource_type": "raw"}
    )]


def test_cloudinary_upload_failure_is_not_silenced(tmp_path, monkeypatch):
    storage = CloudinaryStorage("test_cloud", "test_key", "test_secret")
    image_path = tmp_path / "poster.jpg"
    image_path.write_bytes(b"image")

    def raise_cloudinary_error(*args, **kwargs):
        raise cloudinary.exceptions.Error("provider unavailable")

    monkeypatch.setattr(
        "app.storage.cloudinary.cloudinary.uploader.upload",
        raise_cloudinary_error,
    )

    with pytest.raises(StorageError, match="Cloudinary upload failed.*provider unavailable"):
        storage.save(image_path, "artwork/episode-1/poster.jpg")

def test_storage_factory_local(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "storage_backend", "local")
    import app.storage
    importlib.reload(app.storage)
    
    from app.storage import storage
    assert isinstance(storage, LocalStorage)

def test_storage_factory_cloudinary_missing_credentials(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "storage_backend", "cloudinary")
    monkeypatch.setattr(settings, "cloudinary_cloud_name", None)
    
    import app.storage
    with pytest.raises(ValueError, match="Cloudinary credentials are required"):
        importlib.reload(app.storage)

def test_storage_factory_unsupported(monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "storage_backend", "s3")
    
    import app.storage
    with pytest.raises(ValueError, match="Unsupported STORAGE_BACKEND: s3"):
        importlib.reload(app.storage)
