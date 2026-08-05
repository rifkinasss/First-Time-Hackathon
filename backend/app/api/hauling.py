import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hauling import (
    HaulingCreate,
    HaulingResponse,
    HaulingCalculateRequest,
    HaulingSummaryDetailResponse,
)
from app.schemas.hauling_distance_ref import HaulingDistanceRefResponse
from app.schemas.response import APIResponse, create_success_response
from app.services import hauling_service, equipment_service, fuel_service
from app.repositories import hauling_distance_ref_repo, hauling_repo

router = APIRouter(prefix="/haulings", tags=["Haulings"])


@router.get("/distance-ref", response_model=List[HaulingDistanceRefResponse])
def get_distance_references(db: Session = Depends(get_db)):
    """GET /hauling/distance-ref — List tabel acuan jarak, cycle time, dan BCM/HR."""
    return hauling_distance_ref_repo.get_all(db)


@router.post("/calculate", response_model=HaulingResponse, status_code=201)
def calculate_hauling(data: HaulingCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /hauling/calculate — Hitung Fuel Ratio Hauling berdasarkan unit_type, fuel_type, dan distance_km.
    Sistem secara otomatis mencari BCM/HR acuan berdasarkan distance_km.
    """
    equipment = equipment_service.get_equipment_or_404(db, data.equipment_id)
    fuel_ref = fuel_service.get_fuel_reference_or_404(db, data.fuel_reference_id)
    if equipment.activity.lower() != "hauling":
        raise HTTPException(status_code=422, detail="Equipment yang dipilih bukan untuk aktivitas Hauling.")

    create_data = HaulingCreate(
        equipment_id=equipment.id,
        fuel_reference_id=fuel_ref.id,
        distance_km=data.distance_km,
    )
    return hauling_service.create_hauling(db, create_data)


@router.get("/summary", response_model=List[HaulingSummaryDetailResponse])
def get_hauling_summaries(db: Session = Depends(get_db)):
    """GET /hauling/summary — List seluruh summary perhitungan Hauling."""
    haulings = hauling_service.get_all_haulings(db)
    result = []
    for h in haulings:
        if h.summary:
            result.append(
                HaulingSummaryDetailResponse(
                    id=h.summary.id,
                    hauling_id=h.id,
                    unit_type=h.equipment.unit_type if h.equipment else "N/A",
                    fuel_type=h.fuel_reference.type if h.fuel_reference else "N/A",
                    distance_km=h.summary.distance_km,
                    fuel_cons=h.summary.fuel_cons,
                    productivity=h.summary.productivity,
                    fuel_ratio=h.summary.fuel_ratio,
                    created_at=h.summary.created_at,
                )
            )
    return result


@router.get("/{hauling_id}", response_model=APIResponse[HaulingResponse])
def get_hauling(hauling_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/haulings/{id} — Detail transaksi Hauling beserta summary."""
    t0 = time.perf_counter()
    data = hauling_service.get_hauling_or_404(db, hauling_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Detail hauling id={hauling_id} berhasil diambil.",
        execution_time_ms=elapsed_ms,
    )


@router.delete("/{hauling_id}", response_model=APIResponse[dict])
def delete_hauling(hauling_id: int, db: Session = Depends(get_db)):
    """DELETE /api/v1/haulings/{id} — Hapus log/transaksi kalkulasi hauling."""
    t0 = time.perf_counter()
    hauling_service.delete_hauling(db, hauling_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data={"hauling_id": hauling_id},
        message=f"Log transaksi hauling id={hauling_id} berhasil dihapus.",
        execution_time_ms=elapsed_ms,
    )
