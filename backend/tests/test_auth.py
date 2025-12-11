from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_login_with_default_password_returns_token():
    body = {"email": "agent@crmplus.com", "password": "changeme"}
    response = client.post("/api/v1/auth/login", json=body)
    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert "access_token" in payload
