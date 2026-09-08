import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class Area(UUIDPKMixin, TimestampMixin, Base):
    """Represents a patio or pabellon within an establishment."""

    __tablename__ = "areas"

    establishment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("establishments.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    type: Mapped[str] = mapped_column(String(30), nullable=False, default="patio")
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    establishment: Mapped["Establishment"] = relationship(back_populates="areas")
    cells: Mapped[list["Cell"]] = relationship(back_populates="area")
