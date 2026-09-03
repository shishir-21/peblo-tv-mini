from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SeasonBase(BaseModel):
    season_number: int


class SeasonCreate(SeasonBase):
    show_id: UUID


class SeasonUpdate(BaseModel):
    season_number: Optional[int] = None


class SeasonOut(SeasonBase):
    id: UUID
    show_id: UUID

    model_config = ConfigDict(from_attributes=True)
