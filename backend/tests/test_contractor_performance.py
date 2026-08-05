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
