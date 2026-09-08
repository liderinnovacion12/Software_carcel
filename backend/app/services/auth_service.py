import hashlib
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.db.models.user import User

settings = get_settings()


class AuthenticationError(Exception):
    pass


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def authenticate_user(db: Session, username: str, password: str) -> User:
    stmt = select(User).where(User.username == username, User.is_active.is_(True))
    user = db.execute(stmt).scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise AuthenticationError("Usuario o contrasena incorrectos.")
    return user


def issue_tokens(db: Session, user: User) -> tuple[str, str]:
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    user.refresh_token_hash = _hash_token(refresh_token)
    user.refresh_token_expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    db.add(user)
    db.commit()

    return access_token, refresh_token


def rotate_access_token(db: Session, user: User, refresh_token: str) -> str:
    if not user.refresh_token_hash or _hash_token(refresh_token) != user.refresh_token_hash:
        raise AuthenticationError("Token de renovacion invalido.")
    if not user.refresh_token_expires_at or user.refresh_token_expires_at < datetime.now(
        timezone.utc
    ):
        raise AuthenticationError("Token de renovacion expirado.")
    return create_access_token(str(user.id))


def create_user(
    db: Session, username: str, email: str, password: str, full_name: str
) -> User:
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
    )
    db.add(user)
    db.flush()
    return user
