import time
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.fuel_reference import (
    FuelReferenceCreate,
    FuelReferenceUpdate,
    FuelReferenceResponse,
)
from app.schemas.response import APIResponse, create_success_response
from app.services import fuel_service

router = APIRouter(prefix="/fuel-references", tags=["Fuel References"])


@router.get("", response_model=APIResponse[List[FuelReferenceResponse]])
def get_all_fuel_references(db: Session = Depends(get_db)):
    """GET /api/v1/fuel-references — List semua master fuel reference."""
    t0 = time.perf_counter()
    data = fuel_service.get_all_fuel_references(db)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Master data fuel reference berhasil diambil.",
        total_count=len(data),
        execution_time_ms=elapsed_ms,
    )


@router.get("/{ref_id}", response_model=APIResponse[FuelReferenceResponse])
def get_fuel_reference(ref_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/fuel-references/{id} — Detail master fuel reference."""
    t0 = time.perf_counter()
    data = fuel_service.get_fuel_reference_or_404(db, ref_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Detail fuel reference id={ref_id} berhasil diambil.",
        execution_time_ms=elapsed_ms,
    )


@router.post("", response_model=APIResponse[FuelReferenceResponse], status_code=201)
def create_fuel_reference(data: FuelReferenceCreate, db: Session = Depends(get_db)):
    """POST /api/v1/fuel-references — Tambah master fuel reference baru."""
    t0 = time.perf_counter()
    result = fuel_service.create_fuel_reference(db, data)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message=f"Fuel Reference '{result.type}' berhasil ditambahkan.",
        code=201,
        execution_time_ms=elapsed_ms,
    )


@router.put("/{ref_id}", response_model=APIResponse[FuelReferenceResponse])
def update_fuel_reference(ref_id: int, data: FuelReferenceUpdate, db: Session = Depends(get_db)):
    """PUT /api/v1/fuel-references/{id} — Update data fuel reference."""
    t0 = time.perf_counter()
    result = fuel_service.update_fuel_reference(db, ref_id, data)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message=f"Fuel Reference '{result.type}' berhasil diperbarui.",
        execution_time_ms=elapsed_ms,
    )


@router.delete("/{ref_id}", response_model=APIResponse[dict])
def delete_fuel_reference(ref_id: int, db: Session = Depends(get_db)):
    """DELETE /api/v1/fuel-references/{id} — Hapus data fuel reference."""
    t0 = time.perf_counter()
    fuel_service.delete_fuel_reference(db, ref_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data={"ref_id": ref_id},
        message=f"Fuel Reference id={ref_id} berhasil dihapus.",
        execution_time_ms=elapsed_ms,
    )
