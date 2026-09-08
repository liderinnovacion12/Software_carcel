import random
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.db.models.legal_case import LegalCase
from app.db.models.person import Person
from scripts.seed_data.constants import CASE_AUTHORITIES, CASE_STATUSES, CASE_TYPE_LABELS


def create_legal_cases(db: Session, persons: list[Person], radicado_start: int = 1) -> list[LegalCase]:
    cases: list[LegalCase] = []
    radicado_counter = radicado_start

    for person in persons:
        num_cases = 1 if random.random() < 0.8 else 2
        for _ in range(num_cases):
            opened_at = date.today() - timedelta(days=random.randint(60, 2200))
            status = random.choices(
                CASE_STATUSES,
                weights=[10, 20, 15, 12, 10, 13, 20],
            )[0]
            closed_at = None
            if status == "cerrado":
                closed_at = opened_at + timedelta(days=random.randint(90, 900))

            case = LegalCase(
                person_id=person.id,
                radicado=f"RAD-{radicado_counter:08d}-DEMO",
                authority=random.choice(CASE_AUTHORITIES),
                case_type_label=random.choice(CASE_TYPE_LABELS),
                status=status,
                opened_at=opened_at,
                closed_at=closed_at,
            )
            radicado_counter += 1
            db.add(case)
            cases.append(case)

    db.flush()
    return cases
