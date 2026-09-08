from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.session import get_db
from app.schemas.search import SearchResponse
from app.schemas.user import CurrentUser
from app.services.search_service import search_persons

router = APIRouter(prefix="/search", tags=["busqueda"])


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query("", min_length=0, max_length=120),
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("search:read")),
) -> SearchResponse:
    results = search_persons(db, q)
    return SearchResponse(query=q, results=results)
