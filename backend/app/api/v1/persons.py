import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.session import get_db
from app.schemas.person import LegalCaseOut, PersonProfile, TimelineEvent
from app.schemas.user import CurrentUser
from app.services.person_service import build_timeline, get_person_or_none, to_profile

router = APIRouter(prefix="/persons", tags=["personas"])


@router.get("/{person_id}", response_model=PersonProfile)
def get_person(
    person_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("persons:read")),
) -> PersonProfile:
    person = get_person_or_none(db, person_id)
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Persona no encontrada."
        )
    return to_profile(person)


@router.get("/{person_id}/cases", response_model=list[LegalCaseOut])
def get_person_cases(
    person_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("persons:read")),
) -> list[LegalCaseOut]:
    person = get_person_or_none(db, person_id)
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Persona no encontrada."
        )
    return [LegalCaseOut.model_validate(case) for case in person.legal_cases]


@router.get("/{person_id}/timeline", response_model=list[TimelineEvent])
def get_person_timeline(
    person_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("persons:read")),
) -> list[TimelineEvent]:
    person = get_person_or_none(db, person_id)
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Persona no encontrada."
        )
    return build_timeline(db, person_id)
