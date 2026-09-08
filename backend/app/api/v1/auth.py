import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.security import InvalidTokenError, decode_token
from app.db.models.user import User
from app.db.session import get_db
from app.middleware.audit import record_audit_event
from app.schemas.auth import AccessTokenResponse, LoginRequest, RefreshRequest, TokenResponse
from app.services.auth_service import AuthenticationError, authenticate_user, issue_tokens, rotate_access_token

router = APIRouter(prefix="/auth", tags=["autenticacion"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user = authenticate_user(db, payload.username, payload.password)
    except AuthenticationError as exc:
        record_audit_event(
            db,
            action="login_failed",
            entity_type="user",
            entity_id=payload.username,
            payload={"reason": str(exc)},
            ip_address=request.client.host if request.client else None,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc

    access_token, refresh_token = issue_tokens(db, user)

    record_audit_event(
        db,
        action="login",
        entity_type="user",
        entity_id=str(user.id),
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> AccessTokenResponse:
    try:
        user_id = decode_token(payload.refresh_token, expected_type="refresh")
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc

    try:
        user = db.get(User, uuid.UUID(user_id))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido."
        ) from exc
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado."
        )

    try:
        access_token = rotate_access_token(db, user, payload.refresh_token)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc

    return AccessTokenResponse(access_token=access_token)
