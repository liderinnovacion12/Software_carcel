import os
import uuid
from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://bialco:bialco_demo_password@localhost:5432/bialco_test",
)

from app.core.security import hash_password  # noqa: E402
from app.db import session as db_session_module  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.models import *  # noqa: E402,F401,F403
from app.db.models.legal_case import LegalCase  # noqa: E402
from app.db.models.person import Person  # noqa: E402
from app.db.models.rbac import Permission, Role  # noqa: E402
from app.db.models.sentence import Sentence  # noqa: E402
from app.db.models.user import User  # noqa: E402
from app.main import app  # noqa: E402
from scripts.seed_data.generators.users_roles import PERMISSION_CODES  # noqa: E402

TEST_DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(TEST_DATABASE_URL, future=True)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

db_session_module.engine = engine
db_session_module.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="session", autouse=True)
def _create_schema():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def _clean_tables():
    yield
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE'))


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    def _override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[db_session_module.get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db):
    permissions = []
    for code, description in PERMISSION_CODES:
        permission = Permission(code=code, description=description)
        db.add(permission)
        permissions.append(permission)
    db.flush()

    role = Role(name="Administrador General", description="Rol de prueba con acceso total.")
    role.permissions = permissions
    db.add(role)
    db.flush()

    user = User(
        username="admin",
        email="admin@bialco.demo",
        hashed_password=hash_password("Bialco2026*"),
        full_name="Administrador BIALCO",
        is_active=True,
    )
    user.roles = [role]
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, admin_user):
    response = client.post(
        "/api/v1/auth/login", json={"username": "admin", "password": "Bialco2026*"}
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def andres(db):
    from app.db.models.institution import Institution
    from app.db.models.establishment import Establishment
    from app.db.models.person_location import PersonLocation
    from app.db.models.sentence_period import SentencePeriod

    institution = Institution(name="Institucion de prueba", code="INST-TEST")
    db.add(institution)
    db.flush()

    establishment = Establishment(
        institution_id=institution.id,
        name="Establecimiento de prueba",
        code="EP-TEST",
        city="Ciudad de prueba",
        capacity=100,
    )
    db.add(establishment)
    db.flush()

    person = Person(
        institution_id=institution.id,
        internal_code="BIALCO-000001",
        first_name="Andres Felipe",
        last_name="Mendoza Rios",
        identification_type="CC",
        identification_number="1000999888",
        birth_date=date(1990, 4, 12),
        sex="M",
        status="activo",
    )
    db.add(person)
    db.flush()

    db.add(
        PersonLocation(
            person_id=person.id,
            establishment_id=establishment.id,
            effective_from=date.today() - timedelta(days=900),
            effective_to=None,
        )
    )

    legal_case = LegalCase(
        person_id=person.id,
        radicado="RAD-00000001-DEMO",
        authority="Juzgado de prueba",
        case_type_label="Proceso penal (demo)",
        status="documentacion_incompleta",
        opened_at=date.today() - timedelta(days=800),
        closed_at=None,
    )
    db.add(legal_case)
    db.flush()

    sentence = Sentence(
        legal_case_id=legal_case.id,
        sentence_type="privativa de la libertad (demo)",
        total_time_days=365 * 6,
        imposed_at=date.today() - timedelta(days=760),
        status="vigente",
    )
    db.add(sentence)
    db.flush()

    db.add(
        SentencePeriod(
            sentence_id=sentence.id,
            period_type="intramural",
            start_date=sentence.imposed_at,
            end_date=None,
        )
    )
    db.commit()
    db.refresh(person)
    return person
