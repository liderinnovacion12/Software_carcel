import uuid
from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, decode_token
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.user import CurrentUser
from app.services.rbac_service import get_user_permissions

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> CurrentUser:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_error

    try:
        user_id = decode_token(token, expected_type="access")
    except InvalidTokenError as exc:
        raise credentials_error from exc

    try:
        user = db.get(User, uuid.UUID(user_id))
    except ValueError as exc:
        raise credentials_error from exc
    if not user or not user.is_active:
        raise credentials_error

    permissions = get_user_permissions(db, user.id)
    return CurrentUser(
        id=user.id, username=user.username, full_name=user.full_name, permissions=permissions
    )


def require_permission(permission_code: str) -> Callable[[CurrentUser], CurrentUser]:
    def _checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if permission_code not in current_user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta accion.",
            )
        return current_user

    return _checker
