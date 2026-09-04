from abc import ABC, abstractmethod
from pathlib import Path


class StorageError(RuntimeError):
    """Raised when the configured media provider cannot complete an operation."""


class Storage(ABC):

    @abstractmethod
    def save(self, file_path: Path, storage_key: str, resource_type: str = "image") -> str:
        pass

    @abstractmethod
    def get_path(self, storage_key: str) -> Path:
        pass

    @abstractmethod
    def exists(self, storage_key: str, resource_type: str = "image") -> bool:
        pass

    @abstractmethod
    def get_url(self, storage_key: str, resource_type: str = "image") -> str:
        pass
