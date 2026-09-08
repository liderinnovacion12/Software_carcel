import uuid
from datetime import date
from typing import Callable

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models.calculation import CalculationDetail, CalculationRun
from app.db.models.person import Person
from app.services.calculation_rules import redencion_trabajo_estudio, tiempo_cumplido_simple
from app.services.calculation_rules.base import RuleContext, RuleResult

RULE_REGISTRY: dict[str, Callable[[RuleContext], RuleResult]] = {
    "demo-tiempo-cumplido-v1": tiempo_cumplido_simple.calcular,
    "demo-redencion-v1": redencion_trabajo_estudio.calcular,
}

RULE_LABELS: dict[str, str] = {
    "demo-tiempo-cumplido-v1": tiempo_cumplido_simple.RULE_LABEL,
    "demo-redencion-v1": redencion_trabajo_estudio.RULE_LABEL,
}


class UnknownRuleError(Exception):
    pass


class PersonNotFoundError(Exception):
    pass


def run_calculation(
    db: Session,
    person_id: uuid.UUID,
    rule_key: str,
    requested_by_user_id: uuid.UUID | None,
    calculation_date: date | None = None,
) -> CalculationRun:
    rule_fn = RULE_REGISTRY.get(rule_key)
    if rule_fn is None:
        raise UnknownRuleError(f"Regla desconocida: {rule_key}")

    stmt = (
        select(Person)
        .options(
            selectinload(Person.legal_cases),
            selectinload(Person.redemption_records),
        )
        .where(Person.id == person_id)
    )
    person = db.execute(stmt).scalar_one_or_none()
    if person is None:
        raise PersonNotFoundError(f"Persona no encontrada: {person_id}")

    active_sentence = None
    for case in person.legal_cases:
        for sentence in case.sentences:
            if sentence.status == "vigente":
                active_sentence = sentence
                break
        if active_sentence:
            break

    context = RuleContext(
        person=person,
        sentence=active_sentence,
        redemption_records=list(person.redemption_records),
        calculation_date=calculation_date or date.today(),
    )

    result = rule_fn(context)

    run = CalculationRun(
        person_id=person.id,
        sentence_id=active_sentence.id if active_sentence else None,
        rule_reference=rule_key,
        calculation_date=context.calculation_date,
        requested_by_user_id=requested_by_user_id,
        status="completado",
        result_summary=result.summary,
    )
    db.add(run)
    db.flush()

    for index, step in enumerate(result.steps, start=1):
        db.add(
            CalculationDetail(
                calculation_run_id=run.id,
                step_order=index,
                label=step.label,
                input_snapshot=step.input_snapshot,
                output_value=step.output_value,
                unit=step.unit,
                notes=step.notes,
            )
        )

    db.commit()
    db.refresh(run)
    return run


def rule_label(rule_key: str) -> str:
    return RULE_LABELS.get(rule_key, rule_key)
