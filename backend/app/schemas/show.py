from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryOut


class ShowBase(BaseModel):
    title: str
    slug: str
    section: Optional[str] = None
    synopsis: Optional[str] = None
    status: str = "draft"


class ShowCreate(ShowBase):
    category_ids: List[UUID] = []


class ShowUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    section: Optional[str] = None
    synopsis: Optional[str] = None
    status: Optional[str] = None
    category_ids: Optional[List[UUID]] = None


class ShowOut(ShowBase):
    id: UUID
    categories: List[CategoryOut] = []

    model_config = ConfigDict(from_attributes=True)
