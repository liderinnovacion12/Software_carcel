import uuid

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    email: str
    full_name: str
    is_active: bool
    roles: list[str] = []


class CurrentUser(BaseModel):
    """Resolved identity used by request handlers/dependencies."""

    id: uuid.UUID
    username: str
    full_name: str
    permissions: set[str]
