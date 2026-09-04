import os
from pathlib import Path
from app.storage.base import Storage, StorageError
from app.storage.local import LocalStorage
from app.core.config import settings

def _init_storage() -> Storage:
    backend = settings.storage_backend
    
    if backend == "cloudinary":
        from app.storage.cloudinary import CloudinaryStorage
        if not settings.cloudinary_cloud_name or not settings.cloudinary_api_key or not settings.cloudinary_api_secret:
            raise ValueError("Cloudinary credentials are required when STORAGE_BACKEND=cloudinary")
        return CloudinaryStorage(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
        )
    elif backend == "local":
        BASE_DIR = Path(__file__).resolve().parents[2]
        return LocalStorage(BASE_DIR / "storage")
    else:
        raise ValueError(f"Unsupported STORAGE_BACKEND: {backend}")

storage = _init_storage()

__all__ = [
    "Storage",
    "StorageError",
    "LocalStorage",
    "storage",
]
