import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import require_permission
from app.db.models.calculation import CalculationRun
from app.db.session import get_db
from app.schemas.calculation import CalculationRunOut, RunCalculationRequest
from app.schemas.user import CurrentUser
from app.services.calculation_service import (
    PersonNotFoundError,
    UnknownRuleError,
    run_calculation,
)

router = APIRouter(prefix="/persons/{person_id}/calculations", tags=["calculos"])
meta_router = APIRouter(prefix="/calculation-rules", tags=["calculos"])


def _to_out(run: CalculationRun) -> CalculationRunOut:
    responsible_source = (
        run.requested_by.full_name if run.requested_by else "Generado en datos semilla"
    )
    return CalculationRunOut.model_validate(
        {
            "id": run.id,
            "rule_reference": run.rule_reference,
            "calculation_date": run.calculation_date,
            "status": run.status,
            "result_summary": run.result_summary,
            "responsible_source": responsible_source,
            "details": run.details,
        }
    )


@router.get("", response_model=list[CalculationRunOut])
def list_calculations(
    person_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("calculations:read")),
) -> list[CalculationRunOut]:
    stmt = (
        select(CalculationRun)
        .options(
            selectinload(CalculationRun.details), selectinload(CalculationRun.requested_by)
        )
        .where(CalculationRun.person_id == person_id)
        .order_by(CalculationRun.calculation_date.desc())
    )
    runs = db.execute(stmt).scalars().all()
    return [_to_out(run) for run in runs]


@router.post("", response_model=CalculationRunOut, status_code=status.HTTP_201_CREATED)
def create_calculation(
    person_id: uuid.UUID,
    payload: RunCalculationRequest,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_permission("calculations:run")),
) -> CalculationRunOut:
    try:
        run = run_calculation(db, person_id, payload.rule_key, current_user.id)
    except UnknownRuleError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except PersonNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    return _to_out(run)


@meta_router.get("")
def rule_catalog(
    _: CurrentUser = Depends(require_permission("calculations:read")),
) -> dict[str, str]:
    from app.services.calculation_service import RULE_LABELS

    return RULE_LABELS
