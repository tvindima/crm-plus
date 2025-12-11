import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_property():
    response = client.post(
        "/properties/",
        json={
            "title": "Apartamento T2",
            "description": "Apartamento moderno e central.",
            "price": 178000,
            "area": 84.0,
            "location": "Lisboa",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Apartamento T2"
    assert data["status"] == "available"
