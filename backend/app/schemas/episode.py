from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class EpisodeBase(BaseModel):
    episode_id: str
    episode_number: int
    title: str
    synopsis: Optional[str] = None
    duration_seconds: Optional[int] = None
    language: str
    content_group: str
    status: str = "draft"


class EpisodeCreate(EpisodeBase):
    season_id: UUID


class EpisodeUpdate(BaseModel):
    episode_id: Optional[str] = None
    episode_number: Optional[int] = None
    title: Optional[str] = None
    synopsis: Optional[str] = None
    duration_seconds: Optional[int] = None
    language: Optional[str] = None
    content_group: Optional[str] = None
    status: Optional[str] = None


class EpisodeOut(EpisodeBase):
    id: UUID
    season_id: UUID

    model_config = ConfigDict(from_attributes=True)
