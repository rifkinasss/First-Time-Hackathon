from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_all_contractors_performance():
    """Menguji endpoint GET /api/v1/contractors/performance (Fitur 1 / Rule 1)."""
    response = client.get("/api/v1/contractors/performance")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["code"] == 200
    data = res_json["data"]
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "contractor_id" in first
        assert "actual_productivity" in first
        assert "actual_fuel_ratio" in first
        assert "performance_status" in first
        assert "rule_applied" in first
        assert "insight" in first


def test_get_single_contractor_performance():
    """Menguji endpoint GET /api/v1/contractors/{id}/performance untuk contractor_id=1."""
    response = client.get("/api/v1/contractors/1/performance")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["code"] == 200
    data = res_json["data"]
    assert data["contractor_id"] == 1
    assert "performance_status" in data
    assert "rule_applied" in data
    assert "insight" in data


def test_get_all_contractors_fuzzy_risk():
    response = client.get("/api/v1/contractors/fuzzy-risk")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0
    first = data[0]
    assert 0 <= first["risk_score"] <= 1
    assert first["risk_level"] in {"LOW", "NORMAL", "HIGH"}
    assert set(first["membership"]) == {"productivity", "population", "fuel"}
    assert "dominant_rules" in first


def test_get_single_contractor_fuzzy_risk_and_not_found():
    response = client.get("/api/v1/contractors/1/fuzzy-risk")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["contractor_id"] == 1
    assert data["support_dewatering_population"] >= 0

    missing = client.get("/api/v1/contractors/999999/fuzzy-risk")
    assert missing.status_code == 404
