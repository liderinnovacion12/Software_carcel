def test_dashboard_counts_match_seeded_rows(client, auth_headers, andres):
    response = client.get("/api/v1/dashboard/indicators", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()

    assert body["poblacion_registrada"] == 1
    assert body["casos_activos"] == 1
    assert body["establecimientos_count"] == 1
    assert body["capacidad_total"] == 100
    assert body["ocupacion_actual"] == 1
    assert body["ocupacion_porcentaje"] == 1.0
