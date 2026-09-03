
from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


show_categories = Table(
    "show_categories",
    Base.metadata,
    Column(
        "show_id",
        UUID(as_uuid=True),
        ForeignKey("shows.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
