import random
from datetime import timedelta

from sqlalchemy.orm import Session

from app.db.models.redemption_record import RedemptionRecord
from app.db.models.sentence import Sentence
from scripts.seed_data.constants import REDEMPTION_ACTIVITY_TYPES


def create_redemptions(db: Session, sentences: list[Sentence]) -> list[RedemptionRecord]:
    records: list[RedemptionRecord] = []

    active_sentences = [s for s in sentences if s.status == "vigente"]
    sample = random.sample(active_sentences, k=int(len(active_sentences) * 0.45))

    for sentence in sample:
        num_records = random.randint(1, 3)
        cursor = sentence.imposed_at
        for _ in range(num_records):
            period_days = random.randint(30, 180)
            period_start = cursor
            period_end = period_start + timedelta(days=period_days)
            days_worked = period_days
            # Demo ratio: roughly 1 redeemed day per 2 days worked (synthetic, not official).
            redemption_days_granted = max(days_worked // 2, 1)

            record = RedemptionRecord(
                person_id=sentence.legal_case.person_id,
                sentence_id=sentence.id,
                activity_type=random.choice(REDEMPTION_ACTIVITY_TYPES),
                days_worked=days_worked,
                redemption_days_granted=redemption_days_granted,
                period_start=period_start,
                period_end=period_end,
                source="seed",
            )
            db.add(record)
            records.append(record)
            cursor = period_end + timedelta(days=random.randint(5, 30))

    db.flush()
    return records
