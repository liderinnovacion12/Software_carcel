import pytest
from sqlalchemy import func, select

from app.db.models.person import Person
from scripts.seed import TARGET_PERSON_COUNT, run_seed
from scripts.seed_data.generators.golden_case import GOLDEN_IDENTIFICATION


@pytest.mark.slow
def test_seed_produces_expected_population_and_golden_case(db):
    run_seed(reset=True)

    total_persons = db.execute(select(func.count(Person.id))).scalar_one()
    assert total_persons == TARGET_PERSON_COUNT + 1

    golden = db.execute(
        select(Person).where(Person.identification_number == GOLDEN_IDENTIFICATION)
    ).scalar_one_or_none()
    assert golden is not None
    assert golden.full_name == "Andres Felipe Mendoza Rios"
