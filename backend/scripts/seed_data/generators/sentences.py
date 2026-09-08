import random

from sqlalchemy.orm import Session

from app.db.models.legal_case import LegalCase
from app.db.models.sentence import Sentence
from app.db.models.sentence_period import SentencePeriod

SENTENCE_TYPES = ["privativa de la libertad (demo)", "privativa domiciliaria (demo)"]

# Cases in these statuses are considered to have an imposed, active sentence
# for the purposes of this synthetic demo dataset.
SENTENCED_STATUSES = {
    "documentacion_completa",
    "en_espera_decision",
    "en_analisis",
    "documentacion_incompleta",
    "cerrado",
}


def create_sentences(db: Session, cases: list[LegalCase]) -> list[Sentence]:
    sentences: list[Sentence] = []

    for case in cases:
        if case.status not in SENTENCED_STATUSES:
            continue

        total_days = random.randint(365, 365 * 15)
        sentence_status = "cumplida" if case.status == "cerrado" else "vigente"

        sentence = Sentence(
            legal_case_id=case.id,
            sentence_type=random.choice(SENTENCE_TYPES),
            total_time_days=total_days,
            imposed_at=case.opened_at,
            status=sentence_status,
        )
        db.add(sentence)
        db.flush()

        db.add(
            SentencePeriod(
                sentence_id=sentence.id,
                period_type="intramural",
                start_date=case.opened_at,
                end_date=case.closed_at,
            )
        )

        sentences.append(sentence)

    db.flush()
    return sentences
