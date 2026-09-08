from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.session import get_db
from app.schemas.dashboard import DashboardIndicators
from app.schemas.user import CurrentUser
from app.services.dashboard_service import get_dashboard_indicators

router = APIRouter(prefix="/dashboard", tags=["tablero"])


@router.get("/indicators", response_model=DashboardIndicators)
def indicators(
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("dashboard:read")),
) -> DashboardIndicators:
    return get_dashboard_indicators(db)
