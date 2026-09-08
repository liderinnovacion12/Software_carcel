from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.db.models.legal_case import LegalCase
from app.db.models.person import Person
from app.schemas.search import SearchResultItem
from app.services.person_service import current_location

MAX_RESULTS = 15


def search_persons(db: Session, query: str) -> list[SearchResultItem]:
    query = query.strip()
    if not query:
        return []

    like_pattern = f"%{query}%"

    stmt = (
        select(Person)
        .options(selectinload(Person.locations), selectinload(Person.legal_cases))
        .outerjoin(LegalCase, LegalCase.person_id == Person.id)
        .where(
            or_(
                Person.first_name.ilike(like_pattern),
                Person.last_name.ilike(like_pattern),
                Person.internal_code.ilike(like_pattern),
                Person.identification_number.ilike(like_pattern),
                LegalCase.radicado.ilike(like_pattern),
            )
        )
        .distinct()
        .limit(MAX_RESULTS)
    )

    persons = db.execute(stmt).scalars().unique().all()

    results: list[SearchResultItem] = []
    lowered = query.lower()
    for person in persons:
        if lowered in person.first_name.lower() or lowered in person.last_name.lower():
            reason = "Coincidencia por nombre"
        elif lowered in person.identification_number.lower():
            reason = "Coincidencia por identificacion"
        elif lowered in person.internal_code.lower():
            reason = "Coincidencia por codigo interno"
        else:
            reason = "Coincidencia por radicado de proceso"

        location = current_location(person)
        results.append(
            SearchResultItem(
                person_id=person.id,
                full_name=person.full_name,
                internal_code=person.internal_code,
                identification_number=person.identification_number,
                establishment_name=location.establishment_name if location else None,
                status=person.status,
                match_reason=reason,
            )
        )

    return results
