import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class Sentence(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "sentences"

    legal_case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_cases.id"), nullable=False
    )
    sentence_type: Mapped[str] = mapped_column(String(60), nullable=False)
    total_time_days: Mapped[int] = mapped_column(Integer, nullable=False)
    imposed_at: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="vigente")

    legal_case: Mapped["LegalCase"] = relationship(back_populates="sentences")
    periods: Mapped[list["SentencePeriod"]] = relationship(back_populates="sentence")
