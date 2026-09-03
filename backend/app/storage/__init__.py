import os
from pathlib import Path
from app.storage.base import Storage
from app.storage.local import LocalStorage

def _init_storage() -> Storage:
    backend = os.getenv("STORAGE_BACKEND", "local")
    if backend == "r2":
        from app.storage.r2 import R2Storage
        return R2Storage(
            account_id=os.getenv("R2_ACCOUNT_ID", ""),
            access_key=os.getenv("R2_ACCESS_KEY_ID", ""),
            secret_key=os.getenv("R2_SECRET_ACCESS_KEY", ""),
            bucket_name=os.getenv("R2_BUCKET_NAME", ""),
        )
    else:
        BASE_DIR = Path(__file__).resolve().parents[2]
        return LocalStorage(BASE_DIR / "storage")

storage = _init_storage()

__all__ = [
    "Storage",
    "LocalStorage",
    "storage",
]
