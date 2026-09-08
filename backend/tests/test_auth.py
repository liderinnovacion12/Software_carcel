def test_login_success(client, admin_user):
    response = client.post(
        "/api/v1/auth/login", json={"username": "admin", "password": "Bialco2026*"}
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_login_wrong_password(client, admin_user):
    response = client.post(
        "/api/v1/auth/login", json={"username": "admin", "password": "incorrecta"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_protected_endpoint_requires_token(client):
    response = client.get("/api/v1/dashboard/indicators")
    assert response.status_code == 401


def test_refresh_token_flow(client, admin_user):
    login = client.post(
        "/api/v1/auth/login", json={"username": "admin", "password": "Bialco2026*"}
    )
    refresh_token = login.json()["refresh_token"]

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()
