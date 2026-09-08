from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.models.rbac import Permission, Role
from app.db.models.user import User

PERMISSION_CODES = [
    ("persons:read", "Consultar el perfil operativo-juridico de una persona"),
    ("search:read", "Usar la busqueda global"),
    ("calculations:read", "Consultar calculos de tiempo/condena"),
    ("calculations:run", "Ejecutar un nuevo calculo de tiempo/condena"),
    ("dashboard:read", "Consultar los indicadores del tablero"),
    ("establishments:read", "Consultar establecimientos"),
    ("users:read", "Consultar usuarios"),
]


def seed_rbac_and_admin(db: Session) -> User:
    permissions = []
    for code, description in PERMISSION_CODES:
        permission = Permission(code=code, description=description)
        db.add(permission)
        permissions.append(permission)
    db.flush()

    admin_role = Role(
        name="Administrador General",
        description="Acceso completo a todas las funcionalidades disponibles en esta demostracion.",
    )
    admin_role.permissions = permissions
    db.add(admin_role)
    db.flush()

    admin_user = User(
        username="admin",
        email="admin@bialco.demo",
        hashed_password=hash_password("Bialco2026*"),
        full_name="Administrador BIALCO",
        is_active=True,
    )
    admin_user.roles = [admin_role]
    db.add(admin_user)
    db.flush()

    return admin_user
