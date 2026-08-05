import time
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
from app.schemas.response import APIResponse, create_success_response
from app.services import supporting_service, equipment_service, fuel_service
from app.repositories import supporting_repo

router = APIRouter(prefix="/supportings", tags=["Supportings"])


@router.post("/calculate", response_model=SupportingResponse, status_code=201)
def calculate_supporting(data: SupportingCalculateRequest, db: Session = Depends(get_db)):
    """
    POST /supporting/calculate — Hitung Fuel Ratio & Total Fuel (Liter) untuk unit Supporting.
    Berdasarkan unit_type, fuel_type, PA, UA, EWH, dan Total Produksi Tambang (BCM).
    """
    equipment = equipment_service.get_equipment_or_404(db, data.equipment_id)
    fuel_ref = fuel_service.get_fuel_reference_or_404(db, data.fuel_reference_id)
    if equipment.activity.lower() != "supporting":
        raise HTTPException(status_code=422, detail="Equipment yang dipilih bukan untuk aktivitas Supporting.")

    create_data = SupportingCreate(
        equipment_id=equipment.id,
        fuel_reference_id=fuel_ref.id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
        fuel_consumed_liters=data.fuel_consumed_liters,
        operating_hours=data.operating_hours,
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
        contractor_id=data.contractor_id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
        fuel_consumed_liters=data.fuel_consumed_liters,
        operating_hours=data.operating_hours,
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
                    fuel_cons_reference=s.summary.fuel_cons_reference,
                    fuel_cons_actual=s.summary.fuel_cons_actual,
                    fuel_ratio_reference=s.summary.fuel_ratio_reference,
                    fuel_ratio_actual=s.summary.fuel_ratio_actual,
                    data_source=s.summary.data_source,
                    created_at=s.summary.created_at,
                )
            )
    return result


@router.get("/{supporting_id}", response_model=APIResponse[SupportingResponse])
def get_supporting(supporting_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/supportings/{id} — Detail transaksi Supporting beserta summary."""
    t0 = time.perf_counter()
    data = supporting_service.get_supporting_or_404(db, supporting_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Detail supporting id={supporting_id} berhasil diambil.",
        execution_time_ms=elapsed_ms,
    )


@router.delete("/{supporting_id}", response_model=APIResponse[dict])
def delete_supporting(supporting_id: int, db: Session = Depends(get_db)):
    """DELETE /api/v1/supportings/{id} — Hapus log/transaksi kalkulasi supporting."""
    t0 = time.perf_counter()
    supporting_service.delete_supporting(db, supporting_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data={"supporting_id": supporting_id},
        message=f"Log transaksi supporting id={supporting_id} berhasil dihapus.",
        execution_time_ms=elapsed_ms,
    )
