import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class RedemptionRecord(UUIDPKMixin, TimestampMixin, Base):
    """Redencion de pena por trabajo, estudio o ensenanza (synthetic demo record)."""

    __tablename__ = "redemption_records"

    person_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("persons.id"), nullable=False
    )
    sentence_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sentences.id"), nullable=True
    )
    activity_type: Mapped[str] = mapped_column(String(40), nullable=False)
    days_worked: Mapped[int] = mapped_column(Integer, nullable=False)
    redemption_days_granted: Mapped[int] = mapped_column(Integer, nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    source: Mapped[str] = mapped_column(String(40), nullable=False, default="seed")

    person: Mapped["Person"] = relationship(back_populates="redemption_records")
    sentence: Mapped["Sentence | None"] = relationship()
