from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dewatering import (
    DewateringCreate,
    DewateringResponse,
    DewateringCalculateRequest,
    DewateringSummaryDetailResponse,
    DewateringBatchCalculateRequest,
    DewateringBatchResponse,
)
from app.services import dewatering_service, equipment_service, fuel_service
from app.repositories import dewatering_repo

router = APIRouter(prefix="/dewatering", tags=["Dewatering"])


@router.post("/calculate", response_model=DewateringResponse, status_code=201)
def calculate_dewatering(data: DewateringCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /dewatering/calculate — Hitung Fuel Ratio & Total Fuel (Liter) untuk unit Dewatering.
    Berdasarkan unit_type, fuel_type, PA, UA, EWH, dan Total Produksi Tambang (BCM).
    """
    equipment = equipment_service.get_by_unit_or_404(db, data.unit_type)
    fuel_ref = fuel_service.get_by_type_or_404(db, data.fuel_type)

    create_data = DewateringCreate(
        equipment_id=equipment.id,
        fuel_reference_id=fuel_ref.id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
    )
    return dewatering_service.create_dewatering(db, create_data)


@router.post("/calculate-all", response_model=DewateringBatchResponse)
def calculate_all_dewatering(data: DewateringBatchCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /dewatering/calculate-all — Kalkulasi Otomatis Batch untuk SELURUH unit Dewatering di Master Equipment.
    Secara otomatis mengambil unit_type dari Master Equipment, mencocokkan Ref Fuel,
    serta menghitung Fuel Ratio per unit & Total Fuel Ratio Agregat Dewatering.
    """
    return dewatering_service.auto_calculate_all_dewatering(
        db=db,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
    )


@router.get("/summary", response_model=List[DewateringSummaryDetailResponse])
def get_dewatering_summaries(db: Session = Depends(get_db)):
    """GET /dewatering/summary — List seluruh summary perhitungan Dewatering."""
    dewaterings = dewatering_service.get_all_dewaterings(db)
    result = []
    for d in dewaterings:
        if d.summary:
            result.append(
                DewateringSummaryDetailResponse(
                    id=d.summary.id,
                    dewatering_id=d.id,
                    unit_type=d.equipment.unit_type if d.equipment else "N/A",
                    fuel_type=d.fuel_reference.type if d.fuel_reference else "N/A",
                    pa=d.summary.pa,
                    ua=d.summary.ua,
                    ewh=d.summary.ewh,
                    fuel_cons_lhr=d.summary.fuel_cons_lhr,
                    total_fuel_liters=d.summary.total_fuel_liters,
                    total_mine_prod_bcm=d.summary.total_mine_prod_bcm,
                    fuel_ratio=d.summary.fuel_ratio,
                    created_at=d.summary.created_at,
                )
            )
    return result


@router.get("/{dewatering_id}", response_model=DewateringResponse)
def get_dewatering(dewatering_id: int, db: Session = Depends(get_db)):
    """GET /dewatering/{id} — Detail transaksi Dewatering beserta summary."""
    return dewatering_service.get_dewatering_or_404(db, dewatering_id)
