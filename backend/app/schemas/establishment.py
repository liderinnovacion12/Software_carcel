import uuid

from pydantic import BaseModel, ConfigDict


class EstablishmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str
    city: str
    capacity: int
    occupancy: int
