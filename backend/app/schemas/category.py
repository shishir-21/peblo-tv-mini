from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
