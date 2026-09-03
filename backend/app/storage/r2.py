import boto3
from pathlib import Path
from app.storage.base import Storage

class R2Storage(Storage):
    def __init__(self, account_id: str, access_key: str, secret_key: str, bucket_name: str):
        self.bucket_name = bucket_name
        self.s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="auto"
        )
        
    def save(self, file_path: Path, storage_key: str) -> str:
        self.s3.upload_file(str(file_path), self.bucket_name, storage_key)
        return storage_key

    def get_path(self, storage_key: str) -> Path:
        return Path(storage_key)

    def exists(self, storage_key: str) -> bool:
        try:
            self.s3.head_object(Bucket=self.bucket_name, Key=storage_key)
            return True
        except Exception:
            return False
