from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models.establishment import Establishment
from app.db.models.legal_case import LegalCase
from app.db.models.person import Person
from app.db.models.person_location import PersonLocation
from app.db.models.redemption_record import RedemptionRecord
from app.db.models.sentence import Sentence
from app.schemas.dashboard import DashboardIndicators


def get_dashboard_indicators(db: Session) -> DashboardIndicators:
    poblacion_registrada = db.execute(select(func.count(Person.id))).scalar_one()

    casos_activos = db.execute(
        select(func.count(LegalCase.id)).where(LegalCase.status != "cerrado")
    ).scalar_one()

    casos_pendientes_revision = db.execute(
        select(func.count(LegalCase.id)).where(LegalCase.status == "identificado")
    ).scalar_one()

    # A "sentencia vigente" without any redemption record is treated as an
    # incomplete/unreviewed file for this demo's simplified dashboard.
    persons_with_redemption = select(RedemptionRecord.person_id).distinct().subquery()
    expedientes_incompletos = db.execute(
        select(func.count(func.distinct(Person.id)))
        .join(LegalCase, LegalCase.person_id == Person.id)
        .join(Sentence, Sentence.legal_case_id == LegalCase.id)
        .where(
            Sentence.status == "vigente",
            Person.id.notin_(select(persons_with_redemption.c.person_id)),
        )
    ).scalar_one()

    redenciones_pendientes = expedientes_incompletos

    establecimientos_count = db.execute(
        select(func.count(Establishment.id))
    ).scalar_one()
    capacidad_total = db.execute(
        select(func.coalesce(func.sum(Establishment.capacity), 0))
    ).scalar_one()

    ocupacion_actual = db.execute(
        select(func.count(func.distinct(PersonLocation.person_id))).where(
            PersonLocation.effective_to.is_(None)
        )
    ).scalar_one()

    ocupacion_porcentaje = (
        round((ocupacion_actual / capacidad_total) * 100, 1) if capacidad_total else 0.0
    )

    return DashboardIndicators(
        poblacion_registrada=poblacion_registrada,
        casos_activos=casos_activos,
        casos_pendientes_revision=casos_pendientes_revision,
        expedientes_incompletos=expedientes_incompletos,
        redenciones_pendientes=redenciones_pendientes,
        establecimientos_count=establecimientos_count,
        capacidad_total=capacidad_total,
        ocupacion_actual=ocupacion_actual,
        ocupacion_porcentaje=ocupacion_porcentaje,
    )
