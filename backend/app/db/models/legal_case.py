import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class LegalCase(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "legal_cases"

    person_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("persons.id"), nullable=False
    )
    radicado: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    authority: Mapped[str] = mapped_column(String(200), nullable=False)
    case_type_label: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(60), nullable=False, default="identificado")
    opened_at: Mapped[date] = mapped_column(Date, nullable=False)
    closed_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    person: Mapped["Person"] = relationship(back_populates="legal_cases")
    sentences: Mapped[list["Sentence"]] = relationship(back_populates="legal_case")
