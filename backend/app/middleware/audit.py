import uuid

from sqlalchemy.orm import Session

from app.core.logging import request_id_ctx
from app.db.models.audit_log import AuditLog


def record_audit_event(
    db: Session,
    *,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    user_id: uuid.UUID | None = None,
    payload: dict | None = None,
    ip_address: str | None = None,
) -> None:
    """Persist an audit trail entry for a sensitive operation.

    Called explicitly from services/routers around mutating or sensitive
    operations (login, calculation runs, etc.) rather than inferred generically,
    since only the caller knows the meaningful entity/action semantics.
    """
    entry = AuditLog(
        correlation_id=request_id_ctx.get(),
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        payload=payload or {},
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
