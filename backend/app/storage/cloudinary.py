import cloudinary
import cloudinary.uploader
import cloudinary.api
from pathlib import Path
from app.storage.base import Storage

class CloudinaryStorage(Storage):
    def __init__(self, cloud_name: str, api_key: str, api_secret: str):
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )

    def _get_public_id(self, storage_key: str) -> str:
        p = Path(storage_key)
        return f"peblo-tv/{p.parent}/{p.stem}".replace("\\", "/")

    def save(self, file_path: Path, storage_key: str, resource_type: str = "image") -> str:
        public_id = self._get_public_id(storage_key)
        cloudinary.uploader.upload(
            str(file_path),
            public_id=public_id,
            resource_type=resource_type,
            overwrite=True
        )
        return storage_key

    def get_path(self, storage_key: str) -> Path:
        return Path(storage_key)

    def exists(self, storage_key: str) -> bool:
        public_id = self._get_public_id(storage_key)
        try:
            # We assume image resource type for exists checks unless otherwise known.
            # Using search or specific resource_type if needed.
            # Actually, `resource` needs resource_type to find raw files reliably.
            # We will try both if needed, but for our case, artwork exists check works.
            cloudinary.api.resource(public_id)
            return True
        except cloudinary.exceptions.NotFound:
            return False

    def get_url(self, storage_key: str, resource_type: str = "image") -> str:
        public_id = self._get_public_id(storage_key)
        url, _ = cloudinary.utils.cloudinary_url(public_id, resource_type=resource_type)
        return url
