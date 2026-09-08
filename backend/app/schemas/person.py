import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    establishment_name: str
    area_name: str | None
    cell_code: str | None
    effective_from: date
    effective_to: date | None


class PersonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    internal_code: str
    full_name: str
    identification_number: str
    status: str


class PersonProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    internal_code: str
    first_name: str
    last_name: str
    full_name: str
    identification_type: str
    identification_number: str
    birth_date: date
    sex: str
    status: str
    current_location: LocationOut | None


class TimelineEvent(BaseModel):
    date: date
    type: str
    title: str
    description: str


class LegalCaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    radicado: str
    authority: str
    case_type_label: str
    status: str
    opened_at: date
    closed_at: date | None
