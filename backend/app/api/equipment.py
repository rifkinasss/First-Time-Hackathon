import time
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse
from app.schemas.response import APIResponse, create_success_response
from app.services import equipment_service

router = APIRouter(prefix="/equipments", tags=["Equipments"])


@router.get("", response_model=APIResponse[List[EquipmentResponse]])
def get_all_equipment(db: Session = Depends(get_db)):
    """GET /api/v1/equipments — List semua master equipment."""
    t0 = time.perf_counter()
    data = equipment_service.get_all_equipment(db)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Master data equipment berhasil diambil.",
        total_count=len(data),
        execution_time_ms=elapsed_ms,
    )


@router.get("/{equipment_id}", response_model=APIResponse[EquipmentResponse])
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/equipments/{id} — Detail equipment."""
    t0 = time.perf_counter()
    data = equipment_service.get_equipment_or_404(db, equipment_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Detail equipment id={equipment_id} berhasil diambil.",
        execution_time_ms=elapsed_ms,
    )


@router.post("", response_model=APIResponse[EquipmentResponse], status_code=201)
def create_equipment(data: EquipmentCreate, db: Session = Depends(get_db)):
    """POST /api/v1/equipments — Tambah master equipment baru."""
    t0 = time.perf_counter()
    result = equipment_service.create_equipment(db, data)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message=f"Equipment '{result.unit_type}' berhasil ditambahkan.",
        code=201,
        execution_time_ms=elapsed_ms,
    )


@router.put("/{equipment_id}", response_model=APIResponse[EquipmentResponse])
def update_equipment(equipment_id: int, data: EquipmentUpdate, db: Session = Depends(get_db)):
    """PUT /api/v1/equipments/{id} — Update data equipment."""
    t0 = time.perf_counter()
    result = equipment_service.update_equipment(db, equipment_id, data)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message=f"Equipment '{result.unit_type}' berhasil diperbarui.",
        execution_time_ms=elapsed_ms,
    )


@router.delete("/{equipment_id}", response_model=APIResponse[dict])
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """DELETE /api/v1/equipments/{id} — Hapus data equipment."""
    t0 = time.perf_counter()
    equipment_service.delete_equipment(db, equipment_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data={"equipment_id": equipment_id},
        message=f"Equipment id={equipment_id} berhasil dihapus.",
        execution_time_ms=elapsed_ms,
    )
