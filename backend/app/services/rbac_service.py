import uuid

from sqlalchemy.orm import Session

from app.db.models.user import User


def get_user_permissions(db: Session, user_id: uuid.UUID) -> set[str]:
    user = db.get(User, user_id)
    if not user:
        return set()
    permissions: set[str] = set()
    for role in user.roles:
        for permission in role.permissions:
            permissions.add(permission.code)
    return permissions


def get_user_role_names(user: User) -> list[str]:
    return [role.name for role in user.roles]
