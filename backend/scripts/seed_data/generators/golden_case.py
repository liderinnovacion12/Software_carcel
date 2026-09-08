from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.db.models.area import Area
from app.db.models.cell import Cell
from app.db.models.establishment import Establishment
from app.db.models.institution import Institution
from app.db.models.legal_case import LegalCase
from app.db.models.person import Person
from app.db.models.person_location import PersonLocation
from app.db.models.redemption_record import RedemptionRecord
from app.db.models.sentence import Sentence
from app.db.models.sentence_period import SentencePeriod
from app.services.calculation_service import run_calculation

GOLDEN_INTERNAL_CODE = "BIALCO-000001"
GOLDEN_IDENTIFICATION = "1000999888"


def create_golden_case(
    db: Session, institution: Institution, establishments: list[Establishment]
) -> Person:
    """Builds the polished, always-present demo case: Andres Felipe Mendoza Rios.

    This identity is entirely fictional (spec section 38) and is hand-built
    (not randomly drawn) so the golden-path demo walkthrough is reproducible
    regardless of the random seed used for the bulk synthetic population.
    """
    establishment = establishments[0]
    area = db.query(Area).filter(Area.establishment_id == establishment.id).first()
    cell = db.query(Cell).filter(Cell.area_id == area.id).first() if area else None

    entry_date = date.today() - timedelta(days=980)

    person = Person(
        institution_id=institution.id,
        internal_code=GOLDEN_INTERNAL_CODE,
        first_name="Andres Felipe",
        last_name="Mendoza Rios",
        identification_type="CC",
        identification_number=GOLDEN_IDENTIFICATION,
        birth_date=date(1990, 4, 12),
        sex="M",
        status="activo",
    )
    db.add(person)
    db.flush()

    db.add(
        PersonLocation(
            person_id=person.id,
            establishment_id=establishment.id,
            area_id=area.id if area else None,
            cell_id=cell.id if cell else None,
            effective_from=entry_date,
            effective_to=None,
        )
    )

    case_opened_at = entry_date + timedelta(days=15)
    legal_case = LegalCase(
        person_id=person.id,
        radicado="RAD-00000001-DEMO",
        authority="Juzgado de Ejecucion de Penas y Medidas de Seguridad No. 1 (demo)",
        case_type_label="Proceso penal - etapa de ejecucion de penas (demo)",
        status="documentacion_incompleta",
        opened_at=case_opened_at,
        closed_at=None,
    )
    db.add(legal_case)
    db.flush()

    sentence = Sentence(
        legal_case_id=legal_case.id,
        sentence_type="privativa de la libertad (demo)",
        total_time_days=365 * 6,
        imposed_at=case_opened_at + timedelta(days=45),
        status="vigente",
    )
    db.add(sentence)
    db.flush()

    db.add(
        SentencePeriod(
            sentence_id=sentence.id,
            period_type="intramural",
            start_date=sentence.imposed_at,
            end_date=None,
        )
    )

    redemption_periods = [
        (sentence.imposed_at + timedelta(days=30), sentence.imposed_at + timedelta(days=150), "trabajo"),
        (sentence.imposed_at + timedelta(days=160), sentence.imposed_at + timedelta(days=280), "estudio"),
    ]
    for period_start, period_end, activity_type in redemption_periods:
        days_worked = (period_end - period_start).days
        db.add(
            RedemptionRecord(
                person_id=person.id,
                sentence_id=sentence.id,
                activity_type=activity_type,
                days_worked=days_worked,
                redemption_days_granted=max(days_worked // 2, 1),
                period_start=period_start,
                period_end=period_end,
                source="seed",
            )
        )

    db.flush()

    run_calculation(
        db,
        person_id=person.id,
        rule_key="demo-redencion-v1",
        requested_by_user_id=None,
    )

    return person
