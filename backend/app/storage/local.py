import shutil
from pathlib import Path

from app.storage.base import Storage


class LocalStorage(Storage):

    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save(self, file_path: Path, storage_key: str, resource_type: str = "image") -> str:
        import os
        destination = self.base_path / storage_key

        destination.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        tmp_dest = destination.with_suffix('.tmp' + destination.suffix)
        shutil.copy2(file_path, tmp_dest)
        os.replace(tmp_dest, destination)

        return storage_key

    def get_path(self, storage_key: str) -> Path:
        return self.base_path / storage_key

    def exists(self, storage_key: str) -> bool:
        return self.get_path(storage_key).exists()

    def get_url(self, storage_key: str, resource_type: str = "image") -> str:
        return f"/storage/{storage_key}"
    