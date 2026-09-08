from sqlalchemy.orm import Session

from app.db.models.institution import Institution


def create_institution(db: Session) -> Institution:
    institution = Institution(
        name="Instituto Nacional Demostrativo (BIALCO Demo)",
        code="INST-DEMO-01",
    )
    db.add(institution)
    db.flush()
    return institution
