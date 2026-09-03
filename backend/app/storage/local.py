import shutil
from pathlib import Path

from app.storage.base import Storage


class LocalStorage(Storage):

    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save(self, file_path: Path, storage_key: str) -> str:
        destination = self.base_path / storage_key

        destination.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        shutil.copy2(file_path, destination)

        return storage_key

    def get_path(self, storage_key: str) -> Path:
        return self.base_path / storage_key

    def exists(self, storage_key: str) -> bool:
        return self.get_path(storage_key).exists()
    