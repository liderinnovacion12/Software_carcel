"""Deterministic synthetic-data seed for BIALCO's demo environment.

Usage:
    python -m scripts.seed [--reset]

Generates ~800 fictional incarcerated persons ("Datos sinteticos para
demostracion") plus establishments, legal cases, sentences, redemption
records, a sample of traceable calculations, and the polished golden demo
case (Andres Felipe Mendoza Rios). Deterministic via a fixed random seed so
the demo is reproducible.
"""

import argparse
import random
import sys

from faker import Faker
from sqlalchemy import text

from app.db.models import Institution  # noqa: F401 - ensures models are registered
from app.db.session import SessionLocal
from scripts.seed_data.generators.calculations import create_sample_calculations
from scripts.seed_data.generators.establishments import create_establishments
from scripts.seed_data.generators.golden_case import create_golden_case
from scripts.seed_data.generators.institutions import create_institution
from scripts.seed_data.generators.legal_cases import create_legal_cases
from scripts.seed_data.generators.persons import create_persons
from scripts.seed_data.generators.redemptions import create_redemptions
from scripts.seed_data.generators.sentences import create_sentences
from scripts.seed_data.generators.users_roles import seed_rbac_and_admin

SEED_VALUE = 42
TARGET_PERSON_COUNT = 800

RESET_TABLES = [
    "calculation_details",
    "calculation_runs",
    "redemption_records",
    "sentence_periods",
    "sentences",
    "legal_cases",
    "person_locations",
    "persons",
    "cells",
    "areas",
    "establishments",
    "institutions",
    "audit_logs",
    "user_roles",
    "role_permissions",
    "users",
    "roles",
    "permissions",
]


def reset_database(db) -> None:
    for table in RESET_TABLES:
        db.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
    db.commit()


def run_seed(reset: bool) -> None:
    random.seed(SEED_VALUE)
    Faker.seed(SEED_VALUE)

    db = SessionLocal()
    try:
        if reset:
            print("Eliminando datos existentes...")
            reset_database(db)

        print("Creando institucion...")
        institution = create_institution(db)

        print("Creando establecimientos, patios y celdas...")
        establishments = create_establishments(db, institution)

        print("Creando roles, permisos y usuario administrador...")
        admin_user = seed_rbac_and_admin(db)

        print(f"Creando {TARGET_PERSON_COUNT} personas sinteticas...")
        persons = create_persons(
            db, institution, establishments, TARGET_PERSON_COUNT, start_index=2
        )

        print("Creando procesos legales...")
        cases = create_legal_cases(db, persons, radicado_start=2)

        print("Creando sentencias y periodos...")
        sentences = create_sentences(db, cases)

        print("Creando registros de redencion...")
        redemptions = create_redemptions(db, sentences)

        print("Ejecutando una muestra de calculos trazables...")
        calc_count = create_sample_calculations(db, sentences)

        print("Creando el caso destacado de demostracion (Andres Felipe Mendoza Rios)...")
        golden_person = create_golden_case(db, institution, establishments)

        db.commit()

        print("\nResumen de siembra de datos sinteticos:")
        print(f"  Institucion:         1 ({institution.name})")
        print(f"  Establecimientos:    {len(establishments)}")
        print(f"  Usuario admin:       {admin_user.username} (contrasena: Bialco2026*)")
        print(f"  Personas:            {len(persons) + 1} (incluye caso destacado)")
        print(f"  Procesos legales:    {len(cases) + 1}")
        print(f"  Sentencias:          {len(sentences) + 1}")
        print(f"  Redenciones:         {len(redemptions) + 2}")
        print(f"  Calculos ejecutados: {calc_count + 1}")
        print(f"  Caso destacado:      {golden_person.full_name} ({golden_person.internal_code})")
        print("\nDatos sinteticos para demostracion generados correctamente.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Siembra datos sinteticos de BIALCO.")
    parser.add_argument(
        "--reset", action="store_true", help="Elimina los datos existentes antes de sembrar."
    )
    args = parser.parse_args()

    try:
        run_seed(reset=args.reset)
    except Exception as exc:  # noqa: BLE001 - top-level script error reporting
        print(f"Error al sembrar datos: {exc}", file=sys.stderr)
        sys.exit(1)
