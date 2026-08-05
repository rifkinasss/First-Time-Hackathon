from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_single_calculation_rejects_ambiguous_unit_type_request():
    """Request lama berbasis unit_type tidak boleh lagi membuat transaksi ambigu."""
    response = client.post(
        "/api/v1/loadings/calculate",
        json={"unit_type": "EX26007", "fuel_type": "EX26007"},
    )
    assert response.status_code == 422
    assert "equipment_id" in response.text


def test_batch_calculation_requires_contractor_scope():
    """Batch Supporting/Dewatering wajib dibatasi ke satu kontraktor."""
    supporting = client.post(
        "/api/v1/supportings/calculate-all",
        json={"pa": 0.9, "ua": 0.5, "ewh": 10, "total_mine_prod_bcm": 100},
    )
    dewatering = client.post(
        "/api/v1/dewaterings/calculate-all",
        json={"pa": 0.9, "ua": 0.5, "ewh": 10, "total_mine_prod_bcm": 100},
    )

    assert supporting.status_code == 422
    assert dewatering.status_code == 422
    assert "contractor_id" in supporting.text
    assert "contractor_id" in dewatering.text
