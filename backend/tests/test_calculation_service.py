from datetime import date

from app.db.models.redemption_record import RedemptionRecord
from app.services.calculation_service import run_calculation


def test_tiempo_cumplido_simple_is_deterministic(db, andres):
    run = run_calculation(
        db,
        person_id=andres.id,
        rule_key="demo-tiempo-cumplido-v1",
        requested_by_user_id=None,
        calculation_date=date(2026, 1, 1),
    )

    assert run.rule_reference == "demo-tiempo-cumplido-v1"
    assert run.calculation_date == date(2026, 1, 1)
    assert len(run.details) == 3
    assert run.result_summary["tiempo_total_dias"] == 365 * 6

    # Same inputs + same calculation_date must reproduce the same result.
    run2 = run_calculation(
        db,
        person_id=andres.id,
        rule_key="demo-tiempo-cumplido-v1",
        requested_by_user_id=None,
        calculation_date=date(2026, 1, 1),
    )
    assert run2.result_summary == run.result_summary


def test_redencion_rule_includes_redemption_days(db, andres):
    sentence = andres.legal_cases[0].sentences[0]
    db.add(
        RedemptionRecord(
            person_id=andres.id,
            sentence_id=sentence.id,
            activity_type="trabajo",
            days_worked=100,
            redemption_days_granted=50,
            period_start=date(2024, 1, 1),
            period_end=date(2024, 4, 10),
            source="test",
        )
    )
    db.commit()

    run = run_calculation(
        db,
        person_id=andres.id,
        rule_key="demo-redencion-v1",
        requested_by_user_id=None,
        calculation_date=date(2026, 1, 1),
    )

    assert run.result_summary["dias_redimidos"] == 50
    assert run.result_summary["tiempo_efectivo_dias"] == (
        run.result_summary["tiempo_fisico_dias"] + 50
    )
    labels = [detail.label for detail in run.details]
    assert any("redimidos" in label for label in labels)
