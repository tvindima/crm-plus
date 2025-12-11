import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from app.properties import models as _prop_models  # noqa: F401
from app.agents import models as _agent_models  # noqa: F401
from app.agencies import models as _agency_models  # noqa: F401

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_create_property():
    response = client.post(
        "/properties/",
        json={
            "reference": "TEST-100",
            "title": "Apartamento T2",
            "description": "Apartamento moderno e central.",
            "price": 178000,
            "usable_area": 84.0,
            "location": "Lisboa",
            "business_type": "Venda",
            "property_type": "Apartamento",
            "typology": "T2",
            "images": ["http://localhost/media/test.jpg"],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Apartamento T2"
    assert data["status"] == "available"
    assert data["reference"] == "TEST-100"
