from typing import List
from app.schemas.loading import LoadingRowInput


def validate_rows(rows: List[LoadingRowInput]) -> None:
    """
    Validasi seluruh row input sesuai business rule PRD.
    Raises ValueError jika ada pelanggaran.
    """
    if not rows:
        raise ValueError("rows tidak boleh kosong")

    for i, row in enumerate(rows, start=1):
        if row.qty <= 0:
            raise ValueError(f"Row {i} ({row.unit_type}): qty harus lebih dari 0, dapat: {row.qty}")
        if row.fuel_cons <= 0:
            raise ValueError(f"Row {i} ({row.unit_type}): fuel_cons harus lebih dari 0, dapat: {row.fuel_cons}")
        if row.productivity <= 0:
            raise ValueError(f"Row {i} ({row.unit_type}): productivity harus lebih dari 0, dapat: {row.productivity}")
