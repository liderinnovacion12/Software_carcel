import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models.person import Person
from app.db.models.person_location import PersonLocation
from app.schemas.person import LocationOut, PersonProfile, TimelineEvent


def get_person_or_none(db: Session, person_id: uuid.UUID) -> Person | None:
    stmt = (
        select(Person)
        .options(
            selectinload(Person.locations),
            selectinload(Person.legal_cases),
        )
        .where(Person.id == person_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def current_location(person: Person) -> LocationOut | None:
    for location in person.locations:
        if location.is_current:
            return LocationOut(
                establishment_name=location.establishment.name,
                area_name=location.area.name if location.area else None,
                cell_code=location.cell.code if location.cell else None,
                effective_from=location.effective_from,
                effective_to=location.effective_to,
            )
    return None


def to_profile(person: Person) -> PersonProfile:
    return PersonProfile(
        id=person.id,
        internal_code=person.internal_code,
        first_name=person.first_name,
        last_name=person.last_name,
        full_name=person.full_name,
        identification_type=person.identification_type,
        identification_number=person.identification_number,
        birth_date=person.birth_date,
        sex=person.sex,
        status=person.status,
        current_location=current_location(person),
    )


def build_timeline(db: Session, person_id: uuid.UUID) -> list[TimelineEvent]:
    """Merge case/sentence/redemption/calculation events into one ordered timeline."""
    person = get_person_or_none(db, person_id)
    if not person:
        return []

    events: list[TimelineEvent] = []

    for location in person.locations:
        events.append(
            TimelineEvent(
                date=location.effective_from,
                type="ubicacion",
                title=f"Ingreso a {location.establishment.name}",
                description=(
                    f"Ubicado en {location.area.name if location.area else 'patio no asignado'}"
                    + (f", celda {location.cell.code}" if location.cell else "")
                ),
            )
        )

    for case in person.legal_cases:
        events.append(
            TimelineEvent(
                date=case.opened_at,
                type="caso",
                title=f"Apertura de proceso {case.radicado}",
                description=f"{case.case_type_label} - {case.authority}",
            )
        )
        for sentence in case.sentences:
            events.append(
                TimelineEvent(
                    date=sentence.imposed_at,
                    type="sentencia",
                    title="Sentencia impuesta",
                    description=(
                        f"{sentence.sentence_type}: {sentence.total_time_days} dias totales"
                    ),
                )
            )
            for period in sentence.periods:
                events.append(
                    TimelineEvent(
                        date=period.start_date,
                        type="periodo",
                        title=f"Inicio de periodo {period.period_type}",
                        description=f"Periodo de tipo {period.period_type}",
                    )
                )

    for redemption in person.redemption_records:
        events.append(
            TimelineEvent(
                date=redemption.period_end,
                type="redencion",
                title=f"Redencion por {redemption.activity_type}",
                description=(
                    f"{redemption.days_worked} dias trabajados, "
                    f"{redemption.redemption_days_granted} dias redimidos"
                ),
            )
        )

    for run in person.calculation_runs:
        events.append(
            TimelineEvent(
                date=run.calculation_date,
                type="calculo",
                title="Calculo de tiempo ejecutado",
                description=f"Regla aplicada: {run.rule_reference}",
            )
        )

    events.sort(key=lambda event: event.date)
    return events
