from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.loading import (
    LoadingCalculateRequest,
    LoadingResponse,
    LoadingSummaryDetailResponse,
)
from app.services import loading_service

router = APIRouter(prefix="/loading", tags=["Loading"])


@router.post("/calculate", response_model=LoadingResponse, status_code=201)
def calculate(data: LoadingCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /loading/calculate — Submit input loading dan hitung fuel ratio.

    Alur internal (loading_service):
        1. Cari Fuel          → berdasarkan fuel_type
        2. Cari Productivity  → berdasarkan unit_type
        3. Hitung Fuel Ratio  → fuel_cons / productivity
        4. Simpan Summary     → ke tabel loading_summary
    """
    return loading_service.calculate(
        unit_type=data.unit_type,
        fuel_type=data.fuel_type,
        db=db,
    )


@router.get("/summary", response_model=List[LoadingSummaryDetailResponse])
def get_summary(db: Session = Depends(get_db)):
    """
    GET /loading/summary — Riwayat semua hasil kalkulasi loading.
    """
    loadings = loading_service.get_all_summaries(db)

    result = []
    for loading in loadings:
        if loading.summary:
            result.append(LoadingSummaryDetailResponse(
                id=loading.summary.id,
                loading_id=loading.id,
                unit_type=loading.equipment.unit_type,
                fuel_type=loading.fuel_reference.type,
                fuel_cons=loading.summary.fuel_cons,
                productivity=loading.summary.productivity,
                fuel_ratio=loading.summary.fuel_ratio,
                created_at=loading.summary.created_at,
            ))
    return result
