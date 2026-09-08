import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict


class CalculationDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    step_order: int
    label: str
    input_snapshot: dict
    output_value: str
    unit: str
    notes: str | None


class CalculationRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    rule_reference: str
    calculation_date: date
    status: str
    result_summary: dict
    responsible_source: str
    details: list[CalculationDetailOut]


class RunCalculationRequest(BaseModel):
    rule_key: str = "demo-tiempo-cumplido-v1"
