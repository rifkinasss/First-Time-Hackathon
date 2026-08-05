from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.supporting import (
    SupportingCreate,
    SupportingResponse,
    SupportingCalculateRequest,
    SupportingSummaryDetailResponse,
    SupportingBatchCalculateRequest,
    SupportingBatchResponse,
)
from app.services import supporting_service, equipment_service, fuel_service
from app.repositories import supporting_repo

router = APIRouter(prefix="/supporting", tags=["Supporting"])


@router.post("/calculate", response_model=SupportingResponse, status_code=201)
def calculate_supporting(data: SupportingCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /supporting/calculate — Hitung Fuel Ratio & Total Fuel (Liter) untuk unit Supporting.
    Berdasarkan unit_type, fuel_type, PA, UA, EWH, dan Total Produksi Tambang (BCM).
    """
    equipment = equipment_service.get_by_unit_or_404(db, data.unit_type)
    fuel_ref = fuel_service.get_by_type_or_404(db, data.fuel_type)

    create_data = SupportingCreate(
        equipment_id=equipment.id,
        fuel_reference_id=fuel_ref.id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
    )
    return supporting_service.create_supporting(db, create_data)


@router.post("/calculate-all", response_model=SupportingBatchResponse)
def calculate_all_supporting(data: SupportingBatchCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /supporting/calculate-all — Kalkulasi Otomatis Batch untuk SELURUH unit Supporting di Master Equipment.
    Secara otomatis mengambil unit_type dari Master Equipment, mencocokkan Ref Fuel,
    serta menghitung Fuel Ratio per unit & Total Fuel Ratio Agregat Supporting.
    """
    return supporting_service.auto_calculate_all_supporting(
        db=db,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
    )


@router.get("/summary", response_model=List[SupportingSummaryDetailResponse])
def get_supporting_summaries(db: Session = Depends(get_db)):
    """GET /supporting/summary — List seluruh summary perhitungan Supporting."""
    supportings = supporting_service.get_all_supportings(db)
    result = []
    for s in supportings:
        if s.summary:
            result.append(
                SupportingSummaryDetailResponse(
                    id=s.summary.id,
                    supporting_id=s.id,
                    unit_type=s.equipment.unit_type if s.equipment else "N/A",
                    fuel_type=s.fuel_reference.type if s.fuel_reference else "N/A",
                    pa=s.summary.pa,
                    ua=s.summary.ua,
                    ewh=s.summary.ewh,
                    fuel_cons_lhr=s.summary.fuel_cons_lhr,
                    total_fuel_liters=s.summary.total_fuel_liters,
                    total_mine_prod_bcm=s.summary.total_mine_prod_bcm,
                    fuel_ratio=s.summary.fuel_ratio,
                    created_at=s.summary.created_at,
                )
            )
    return result


@router.get("/{supporting_id}", response_model=SupportingResponse)
def get_supporting(supporting_id: int, db: Session = Depends(get_db)):
    """GET /supporting/{id} — Detail transaksi Supporting beserta summary."""
    return supporting_service.get_supporting_or_404(db, supporting_id)
