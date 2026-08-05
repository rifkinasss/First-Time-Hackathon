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
from app.services import hauling_service, equipment_service, fuel_service
from app.repositories import hauling_distance_ref_repo, hauling_repo

router = APIRouter(prefix="/hauling", tags=["Hauling"])


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
    equipment = equipment_service.get_by_unit_or_404(db, data.unit_type)
    fuel_ref = fuel_service.get_by_type_or_404(db, data.fuel_type)

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


@router.get("/{hauling_id}", response_model=HaulingResponse)
def get_hauling(hauling_id: int, db: Session = Depends(get_db)):
    """GET /hauling/{id} — Detail transaksi Hauling beserta summary."""
    return hauling_service.get_hauling_or_404(db, hauling_id)
