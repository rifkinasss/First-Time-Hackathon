import time
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
from app.schemas.response import APIResponse, create_success_response
from app.services import dewatering_service, equipment_service, fuel_service
from app.repositories import dewatering_repo

router = APIRouter(prefix="/dewaterings", tags=["Dewaterings"])


@router.post("/calculate", response_model=DewateringResponse, status_code=201)
def calculate_dewatering(data: DewateringCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /dewatering/calculate — Hitung Fuel Ratio & Total Fuel (Liter) untuk unit Dewatering.
    Berdasarkan unit_type, fuel_type, PA, UA, EWH, dan Total Produksi Tambang (BCM).
    """
    equipment = equipment_service.get_equipment_or_404(db, data.equipment_id)
    fuel_ref = fuel_service.get_fuel_reference_or_404(db, data.fuel_reference_id)
    if equipment.activity.lower() != "dewatering":
        raise HTTPException(status_code=422, detail="Equipment yang dipilih bukan untuk aktivitas Dewatering.")

    create_data = DewateringCreate(
        equipment_id=equipment.id,
        fuel_reference_id=fuel_ref.id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
        fuel_consumed_liters=data.fuel_consumed_liters,
        operating_hours=data.operating_hours,
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
        contractor_id=data.contractor_id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
        fuel_consumed_liters=data.fuel_consumed_liters,
        operating_hours=data.operating_hours,
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
                    fuel_cons_reference=d.summary.fuel_cons_reference,
                    fuel_cons_actual=d.summary.fuel_cons_actual,
                    fuel_ratio_reference=d.summary.fuel_ratio_reference,
                    fuel_ratio_actual=d.summary.fuel_ratio_actual,
                    data_source=d.summary.data_source,
                    created_at=d.summary.created_at,
                )
            )
    return result


@router.get("/{dewatering_id}", response_model=APIResponse[DewateringResponse])
def get_dewatering(dewatering_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/dewaterings/{id} — Detail transaksi Dewatering beserta summary."""
    t0 = time.perf_counter()
    data = dewatering_service.get_dewatering_or_404(db, dewatering_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Detail dewatering id={dewatering_id} berhasil diambil.",
        execution_time_ms=elapsed_ms,
    )


@router.delete("/{dewatering_id}", response_model=APIResponse[dict])
def delete_dewatering(dewatering_id: int, db: Session = Depends(get_db)):
    """DELETE /api/v1/dewaterings/{id} — Hapus log/transaksi kalkulasi dewatering."""
    t0 = time.perf_counter()
    dewatering_service.delete_dewatering(db, dewatering_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data={"dewatering_id": dewatering_id},
        message=f"Log transaksi dewatering id={dewatering_id} berhasil dihapus.",
        execution_time_ms=elapsed_ms,
    )
