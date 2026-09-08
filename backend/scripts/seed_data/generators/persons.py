import random
from datetime import date, timedelta

from faker import Faker
from sqlalchemy.orm import Session

from app.db.models.area import Area
from app.db.models.cell import Cell
from app.db.models.establishment import Establishment
from app.db.models.institution import Institution
from app.db.models.person import Person
from app.db.models.person_location import PersonLocation

fake = Faker("es_CO")


def _random_birth_date() -> date:
    today = date.today()
    age_years = random.randint(19, 65)
    return today - timedelta(days=age_years * 365 + random.randint(0, 364))


def create_persons(
    db: Session,
    institution: Institution,
    establishments: list[Establishment],
    count: int,
    start_index: int = 1,
) -> list[Person]:
    # Preload areas/cells grouped by establishment so we can assign a
    # plausible current location without a query per person.
    areas_by_establishment: dict = {}
    cells_by_area: dict = {}
    for establishment in establishments:
        areas = db.query(Area).filter(Area.establishment_id == establishment.id).all()
        areas_by_establishment[establishment.id] = areas
        for area in areas:
            cells_by_area[area.id] = (
                db.query(Cell).filter(Cell.area_id == area.id).all()
            )

    persons: list[Person] = []
    used_ids: set[str] = set()

    for offset in range(count):
        index = start_index + offset
        sex = random.choice(["M", "F"])
        first_name = fake.first_name_male() if sex == "M" else fake.first_name_female()
        last_name = f"{fake.last_name()} {fake.last_name()}"

        identification_number = str(random.randint(1_000_000_000, 1_999_999_999))
        while identification_number in used_ids:
            identification_number = str(random.randint(1_000_000_000, 1_999_999_999))
        used_ids.add(identification_number)

        person = Person(
            institution_id=institution.id,
            internal_code=f"BIALCO-{index:06d}",
            first_name=first_name,
            last_name=last_name,
            identification_type="CC",
            identification_number=identification_number,
            birth_date=_random_birth_date(),
            sex=sex,
            status="activo",
        )
        db.add(person)
        persons.append(person)

    db.flush()

    for person in persons:
        establishment = random.choice(establishments)
        areas = areas_by_establishment[establishment.id]
        area = random.choice(areas) if areas else None
        cell = random.choice(cells_by_area[area.id]) if area and cells_by_area[area.id] else None

        entry_date = date.today() - timedelta(days=random.randint(30, 2000))
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

    db.flush()
    return persons
