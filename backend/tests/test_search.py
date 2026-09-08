def test_search_finds_andres_by_name(client, auth_headers, andres):
    response = client.get("/api/v1/search", params={"q": "Andres"}, headers=auth_headers)
    assert response.status_code == 200
    results = response.json()["results"]
    assert any(r["person_id"] == str(andres.id) for r in results)


def test_search_finds_andres_by_identification(client, auth_headers, andres):
    response = client.get(
        "/api/v1/search", params={"q": "1000999888"}, headers=auth_headers
    )
    assert response.status_code == 200
    results = response.json()["results"]
    assert any(r["person_id"] == str(andres.id) for r in results)


def test_search_finds_andres_by_radicado(client, auth_headers, andres):
    response = client.get(
        "/api/v1/search", params={"q": "RAD-00000001"}, headers=auth_headers
    )
    assert response.status_code == 200
    results = response.json()["results"]
    assert any(r["person_id"] == str(andres.id) for r in results)


def test_search_empty_query_returns_no_results(client, auth_headers, andres):
    response = client.get("/api/v1/search", params={"q": ""}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["results"] == []
