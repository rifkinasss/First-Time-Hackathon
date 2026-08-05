import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# ─── Scenario 1: Valid Data ────────────────────────────────────────────────────
def test_valid_data():
    """Fuel Ratio harus sesuai hasil Excel SPO."""
    response = client.post("/api/v1/loadings/calculate", json={
        "rows": [
            {"unit_type": "EX26007",   "qty": 3,  "fuel_cons": 187, "productivity": 920},
            {"unit_type": "PC125011R", "qty": 18, "fuel_cons": 59,  "productivity": 310},
        ]
    })
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert data["total_fuel"] == 3 * 187 + 18 * 59           # 561 + 1062 = 1623
    assert data["total_productivity"] == 3 * 920 + 18 * 310  # 2760 + 5580 = 8340
    assert data["fuel_ratio"] == round(1623 / 8340, 2)


# ─── Scenario 2: Qty = 0 ──────────────────────────────────────────────────────
def test_qty_zero():
    """qty = 0 harus menghasilkan validation error."""
    response = client.post("/api/v1/loadings/calculate", json={
        "rows": [
            {"unit_type": "EX26007", "qty": 0, "fuel_cons": 187, "productivity": 920},
        ]
    })
    assert response.status_code == 422


# ─── Scenario 3: Fuel Cons = 0 ────────────────────────────────────────────────
def test_fuel_cons_zero():
    """fuel_cons = 0 harus menghasilkan validation error."""
    response = client.post("/api/v1/loadings/calculate", json={
        "rows": [
            {"unit_type": "EX26007", "qty": 3, "fuel_cons": 0, "productivity": 920},
        ]
    })
    assert response.status_code == 422


# ─── Scenario 4: Productivity = 0 ─────────────────────────────────────────────
def test_productivity_zero():
    """productivity = 0 harus menghasilkan validation error."""
    response = client.post("/api/v1/loadings/calculate", json={
        "rows": [
            {"unit_type": "EX26007", "qty": 3, "fuel_cons": 187, "productivity": 0},
        ]
    })
    assert response.status_code == 422


# ─── Scenario 5: Rows Kosong ──────────────────────────────────────────────────
def test_empty_rows():
    """rows kosong harus menghasilkan validation error."""
    response = client.post("/api/v1/loadings/calculate", json={"rows": []})
    assert response.status_code == 422
