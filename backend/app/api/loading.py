import time
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.loading import (
    LoadingCreate,
    LoadingCalculateRequest,
    LoadingBatchCalculateRequest,
    LoadingBatchCalculateResponse,
    LoadingResponse,
    LoadingSummaryDetailResponse,
)
from app.schemas.response import APIResponse, create_success_response
from app.services import loading_service, equipment_service, fuel_service

router = APIRouter(prefix="/loadings", tags=["Loadings"])


@router.post("/calculate", response_model=APIResponse[Union[LoadingResponse, LoadingBatchCalculateResponse]], status_code=200)
def calculate(data: Union[LoadingBatchCalculateRequest, LoadingCalculateRequest], db: Session = Depends(get_db)):
    """
    POST /api/v1/loadings/calculate — Submit input loading dan hitung fuel ratio.
    """
    t0 = time.perf_counter()
    if isinstance(data, LoadingBatchCalculateRequest) or hasattr(data, "rows"):
        total_fuel = sum(r.qty * r.fuel_cons for r in data.rows)
        total_prod = sum(r.qty * r.productivity for r in data.rows)
        if total_prod == 0:
            raise HTTPException(status_code=422, detail="Total productivity tidak boleh 0")
        fuel_ratio = round(total_fuel / total_prod, 2)
        batch_res = LoadingBatchCalculateResponse(
            total_fuel=total_fuel,
            total_productivity=total_prod,
            fuel_ratio=fuel_ratio,
        )
        elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
        return create_success_response(
            data=batch_res,
            message="Kalkulasi batch loading berhasil diproses.",
            execution_time_ms=elapsed_ms,
        )

    equipment = equipment_service.get_equipment_or_404(db, data.equipment_id)
    fuel_ref = fuel_service.get_fuel_reference_or_404(db, data.fuel_reference_id)
    if equipment.activity.lower() != "loading":
        raise HTTPException(status_code=422, detail="Equipment yang dipilih bukan untuk aktivitas Loading.")
    res = loading_service.create_loading(
        db=db,
        data=LoadingCreate(
            equipment_id=equipment.id,
            fuel_reference_id=fuel_ref.id,
            fuel_consumed_liters=data.fuel_consumed_liters,
            operating_hours=data.operating_hours,
        ),
    )
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=res,
        message="Kalkulasi loading berhasil diproses.",
        execution_time_ms=elapsed_ms,
    )


@router.get("/summary", response_model=APIResponse[List[LoadingSummaryDetailResponse]])
def get_summary(db: Session = Depends(get_db)):
    """
    GET /api/v1/loadings/summary — Riwayat semua hasil kalkulasi loading.
    """
    t0 = time.perf_counter()
    loadings = loading_service.get_all_summaries(db)

    result = []
    for loading in loadings:
        if loading.summary:
            result.append(LoadingSummaryDetailResponse(
                id=loading.summary.id,
                loading_id=loading.id,
                unit_type=loading.equipment.unit_type if loading.equipment else "N/A",
                fuel_type=loading.fuel_reference.type if loading.fuel_reference else "N/A",
                fuel_cons=loading.summary.fuel_cons,
                productivity=loading.summary.productivity,
                fuel_ratio=loading.summary.fuel_ratio,
                fuel_cons_reference=loading.summary.fuel_cons_reference,
                fuel_cons_actual=loading.summary.fuel_cons_actual,
                fuel_ratio_reference=loading.summary.fuel_ratio_reference,
                fuel_ratio_actual=loading.summary.fuel_ratio_actual,
                data_source=loading.summary.data_source,
                created_at=loading.summary.created_at,
            ))
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message="Summary kalkulasi loading berhasil diambil.",
        total_count=len(result),
        execution_time_ms=elapsed_ms,
    )


@router.post("/summary/backfill", response_model=APIResponse[dict], status_code=200)
def backfill_summary(db: Session = Depends(get_db)):
    """POST /api/v1/loadings/summary/backfill — Isi summary dari master Loading."""
    t0 = time.perf_counter()
    try:
        result = loading_service.backfill_loading_summaries(db)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message="Loading summary berhasil dibuat/diperbarui.",
        execution_time_ms=elapsed_ms,
    )


@router.delete("/{loading_id}", response_model=APIResponse[dict])
def delete_loading(loading_id: int, db: Session = Depends(get_db)):
    """DELETE /api/v1/loadings/{id} — Hapus log/transaksi kalkulasi loading."""
    t0 = time.perf_counter()
    loading_service.delete_loading(db, loading_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data={"loading_id": loading_id},
        message=f"Log transaksi loading id={loading_id} berhasil dihapus.",
        execution_time_ms=elapsed_ms,
    )
