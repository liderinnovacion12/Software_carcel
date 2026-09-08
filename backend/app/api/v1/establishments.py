from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.db.models.establishment import Establishment
from app.db.models.person_location import PersonLocation
from app.db.session import get_db
from app.schemas.establishment import EstablishmentOut
from app.schemas.user import CurrentUser

router = APIRouter(prefix="/establishments", tags=["establecimientos"])


@router.get("", response_model=list[EstablishmentOut])
def list_establishments(
    db: Session = Depends(get_db),
    _: CurrentUser = Depends(require_permission("establishments:read")),
) -> list[EstablishmentOut]:
    establishments = db.execute(select(Establishment)).scalars().all()

    occupancy_stmt = (
        select(PersonLocation.establishment_id, func.count(func.distinct(PersonLocation.person_id)))
        .where(PersonLocation.effective_to.is_(None))
        .group_by(PersonLocation.establishment_id)
    )
    occupancy_by_establishment = dict(db.execute(occupancy_stmt).all())

    return [
        EstablishmentOut(
            id=establishment.id,
            name=establishment.name,
            code=establishment.code,
            city=establishment.city,
            capacity=establishment.capacity,
            occupancy=occupancy_by_establishment.get(establishment.id, 0),
        )
        for establishment in establishments
    ]
