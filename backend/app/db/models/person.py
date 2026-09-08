import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPKMixin


class Person(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "persons"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False
    )
    internal_code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    identification_type: Mapped[str] = mapped_column(String(10), nullable=False, default="CC")
    identification_number: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False
    )
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    sex: Mapped[str] = mapped_column(String(1), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="activo")

    institution: Mapped["Institution"] = relationship(back_populates="persons")
    locations: Mapped[list["PersonLocation"]] = relationship(
        back_populates="person", order_by="PersonLocation.effective_from.desc()"
    )
    legal_cases: Mapped[list["LegalCase"]] = relationship(back_populates="person")
    redemption_records: Mapped[list["RedemptionRecord"]] = relationship(
        back_populates="person"
    )
    calculation_runs: Mapped[list["CalculationRun"]] = relationship(back_populates="person")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
