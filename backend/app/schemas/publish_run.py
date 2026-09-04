from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class PublishRunOut(BaseModel):
    id: UUID
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    triggered_by: Optional[UUID]
    shows_count: Optional[int]
    episodes_count: Optional[int]
    catalogue_hash: Optional[str]
    error_message: Optional[str]

    model_config = ConfigDict(from_attributes=True)
