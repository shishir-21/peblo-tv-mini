from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+psycopg://peblo:peblo_password@localhost:5433/peblo_tv"
    )


settings = Settings()
