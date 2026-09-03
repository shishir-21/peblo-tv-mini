import uuid

from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Season(Base):
    __tablename__ = "seasons"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    show_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("shows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    season_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    show = relationship(
        "Show",
        back_populates="seasons",
    )

    episodes = relationship(
        "Episode",
        back_populates="season",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint(
            "show_id",
            "season_number",
            name="uq_season_show_number",
        ),
    )