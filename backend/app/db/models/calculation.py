import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class CalculationRun(UUIDPKMixin, TimestampMixin, Base):
    """A single traceable execution of the time/sentence calculation engine."""

    __tablename__ = "calculation_runs"

    person_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("persons.id"), nullable=False
    )
    sentence_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sentences.id"), nullable=True
    )
    rule_reference: Mapped[str] = mapped_column(String(80), nullable=False)
    calculation_date: Mapped[date] = mapped_column(Date, nullable=False)
    requested_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="completado")
    result_summary: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    person: Mapped["Person"] = relationship(back_populates="calculation_runs")
    sentence: Mapped["Sentence | None"] = relationship()
    requested_by: Mapped["User | None"] = relationship()
    details: Mapped[list["CalculationDetail"]] = relationship(
        back_populates="calculation_run", order_by="CalculationDetail.step_order"
    )


class CalculationDetail(UUIDPKMixin, Base):
    __tablename__ = "calculation_details"

    calculation_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("calculation_runs.id"), nullable=False
    )
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    input_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    output_value: Mapped[str] = mapped_column(String(60), nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False, default="dias")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    calculation_run: Mapped["CalculationRun"] = relationship(back_populates="details")
