import pytest
from pathlib import Path
from app.storage.local import LocalStorage
from app.storage.cloudinary import CloudinaryStorage
import os
import importlib

def test_local_storage(tmp_path):
    storage = LocalStorage(tmp_path)
    file_path = tmp_path / "test.txt"
    file_path.write_text("hello")
    
    key = storage.save(file_path, "docs/test.txt")
    assert key == "docs/test.txt"
    
    assert storage.exists("docs/test.txt")
    assert storage.get_path("docs/test.txt") == tmp_path / "docs/test.txt"
    assert storage.get_url("docs/test.txt") == "/storage/docs/test.txt"

def test_cloudinary_storage_initialization():
    storage = CloudinaryStorage(
        cloud_name="test_cloud",
        api_key="test_key",
        api_secret="test_secret"
    )
    # Using mock assertions here isn't strictly necessary for initialization
    assert storage is not None

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
