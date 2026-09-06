import cloudinary
import cloudinary.uploader
import cloudinary.api
from pathlib import Path
from app.storage.base import Storage, StorageError


SUPPORTED_RESOURCE_TYPES = {"image", "raw"}

class CloudinaryStorage(Storage):
    def __init__(self, cloud_name: str, api_key: str, api_secret: str):
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )

    def _get_public_id(self, storage_key: str, resource_type: str = "image") -> str:
        self._validate_resource_type(resource_type)
        p = Path(storage_key)
        filename = p.name if resource_type == "raw" else p.stem
        # if p.parent is '.', we shouldn't add a trailing slash before filename
        parent_path = f"{p.parent}/" if str(p.parent) != "." else ""
        return f"peblo-tv/{parent_path}{filename}".replace("\\", "/")

    @staticmethod
    def _validate_resource_type(resource_type: str) -> None:
        if resource_type not in SUPPORTED_RESOURCE_TYPES:
            raise ValueError(
                f"Unsupported Cloudinary resource type: {resource_type}. "
                "Expected image or raw."
            )

    def save(self, file_path: Path, storage_key: str, resource_type: str = "image") -> str:
        public_id = self._get_public_id(storage_key, resource_type=resource_type)
        try:
            cloudinary.uploader.upload(
                str(file_path),
                public_id=public_id,
                resource_type=resource_type,
                overwrite=True,
                invalidate=True,
            )
        except cloudinary.exceptions.Error as exc:
            raise StorageError(
                f"Cloudinary upload failed for {storage_key} "
                f"({resource_type}): {exc}"
            ) from exc
        return storage_key

    def get_path(self, storage_key: str) -> Path:
        return Path(storage_key)

    def exists(self, storage_key: str, resource_type: str = "image") -> bool:
        public_id = self._get_public_id(storage_key, resource_type=resource_type)
        try:
            cloudinary.api.resource(public_id, resource_type=resource_type)
            return True
        except cloudinary.exceptions.NotFound:
            return False
        except cloudinary.exceptions.Error as exc:
            raise StorageError(
                f"Cloudinary existence check failed for {storage_key} "
                f"({resource_type}): {exc}"
            ) from exc

    def get_url(self, storage_key: str, resource_type: str = "image") -> str:
        public_id = self._get_public_id(storage_key, resource_type=resource_type)
        url, _ = cloudinary.utils.cloudinary_url(public_id, resource_type=resource_type)
        return url
