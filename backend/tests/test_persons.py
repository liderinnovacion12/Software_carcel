import uuid


def test_get_person_profile(client, auth_headers, andres):
    response = client.get(f"/api/v1/persons/{andres.id}", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["full_name"] == "Andres Felipe Mendoza Rios"
    assert body["current_location"]["establishment_name"] == "Establecimiento de prueba"


def test_get_person_not_found(client, auth_headers):
    response = client.get(f"/api/v1/persons/{uuid.uuid4()}", headers=auth_headers)
    assert response.status_code == 404


def test_get_person_timeline_ordered(client, auth_headers, andres):
    response = client.get(f"/api/v1/persons/{andres.id}/timeline", headers=auth_headers)
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 2
    dates = [event["date"] for event in events]
    assert dates == sorted(dates)


def test_get_person_cases(client, auth_headers, andres):
    response = client.get(f"/api/v1/persons/{andres.id}/cases", headers=auth_headers)
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) == 1
    assert cases[0]["radicado"] == "RAD-00000001-DEMO"
