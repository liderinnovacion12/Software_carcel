import random

from sqlalchemy.orm import Session

from app.db.models.area import Area
from app.db.models.cell import Cell
from app.db.models.establishment import Establishment
from app.db.models.institution import Institution
from scripts.seed_data.constants import AREA_NAMES, ESTABLISHMENTS


def create_establishments(db: Session, institution: Institution) -> list[Establishment]:
    establishments: list[Establishment] = []

    for spec in ESTABLISHMENTS:
        establishment = Establishment(
            institution_id=institution.id,
            name=spec["name"],
            code=spec["code"],
            city=spec["city"],
            capacity=spec["capacity"],
        )
        db.add(establishment)
        db.flush()

        area_count = random.randint(3, 5)
        for area_name in AREA_NAMES[:area_count]:
            area = Area(
                establishment_id=establishment.id,
                name=area_name,
                type="pabellon" if area_name.startswith("Pabellon") else "patio",
                capacity=establishment.capacity // area_count,
            )
            db.add(area)
            db.flush()

            cell_count = max(area.capacity // 4, 5)
            for cell_index in range(1, cell_count + 1):
                db.add(
                    Cell(
                        area_id=area.id,
                        code=f"{area_name[:3].upper()}-{cell_index:03d}",
                        capacity=4,
                    )
                )

        establishments.append(establishment)

    db.flush()
    return establishments
