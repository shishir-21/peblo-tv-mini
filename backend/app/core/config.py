from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://peblo:peblo_password@localhost:5433/peblo_tv"
    
    # Security
    secret_key: str | None = Field(default=None)
    
    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:5174"
    storage_backend: str = "local"
    
    # Cloudinary
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

# Provide a safe development default, but fail fast in production
if not settings.secret_key:
    if os.getenv("ENVIRONMENT") == "production":
        raise ValueError("SECRET_KEY environment variable is missing and is required in production.")
    else:
        settings.secret_key = "dev-secret-key-change-before-production"
