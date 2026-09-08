import random

from sqlalchemy.orm import Session

from app.db.models.sentence import Sentence
from app.services.calculation_service import run_calculation


def create_sample_calculations(db: Session, sentences: list[Sentence], sample_size: int = 120) -> int:
    active_sentences = [s for s in sentences if s.status == "vigente"]
    sample = random.sample(active_sentences, k=min(sample_size, len(active_sentences)))

    created = 0
    for sentence in sample:
        rule_key = random.choice(["demo-tiempo-cumplido-v1", "demo-redencion-v1"])
        run_calculation(
            db,
            person_id=sentence.legal_case.person_id,
            rule_key=rule_key,
            requested_by_user_id=None,
        )
        created += 1

    return created
