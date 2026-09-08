import uuid

from pydantic import BaseModel


class SearchResultItem(BaseModel):
    person_id: uuid.UUID
    full_name: str
    internal_code: str
    identification_number: str
    establishment_name: str | None
    status: str
    match_reason: str


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
