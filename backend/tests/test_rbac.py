from app.core.security import hash_password
from app.db.models.user import User


def test_admin_can_access_dashboard(client, auth_headers):
    response = client.get("/api/v1/dashboard/indicators", headers=auth_headers)
    assert response.status_code == 200


def test_user_without_permission_is_forbidden(client, db):
    user = User(
        username="sin_permisos",
        email="sin_permisos@bialco.demo",
        hashed_password=hash_password("Clave123*"),
        full_name="Usuario Sin Permisos",
        is_active=True,
    )
    db.add(user)
    db.commit()

    login = client.post(
        "/api/v1/auth/login", json={"username": "sin_permisos", "password": "Clave123*"}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    response = client.get(
        "/api/v1/dashboard/indicators", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"
