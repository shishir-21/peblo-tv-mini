from abc import ABC, abstractmethod
from pathlib import Path


class Storage(ABC):

    @abstractmethod
    def save(self, file_path: Path, storage_key: str) -> str:
        pass

    @abstractmethod
    def get_path(self, storage_key: str) -> Path:
        pass

    @abstractmethod
    def exists(self, storage_key: str) -> bool:
        pass

    @abstractmethod
    def get_url(self, storage_key: str) -> str:
        pass
    