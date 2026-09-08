from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class Institution(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)

    establishments: Mapped[list["Establishment"]] = relationship(
        back_populates="institution"
    )
    persons: Mapped[list["Person"]] = relationship(back_populates="institution")
