from typing import List, Union
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.loading import (
    LoadingCalculateRequest,
    LoadingBatchCalculateRequest,
    LoadingBatchCalculateResponse,
    LoadingResponse,
    LoadingSummaryDetailResponse,
)
from app.services import loading_service

router = APIRouter(prefix="/loadings", tags=["Loadings"])


@router.post("/calculate", response_model=Union[LoadingResponse, LoadingBatchCalculateResponse], status_code=200)
def calculate(data: Union[LoadingBatchCalculateRequest, LoadingCalculateRequest], db: Session = Depends(get_db)):
    """
    POST /loading/calculate — Submit input loading dan hitung fuel ratio.
    Mendukung format individual (unit_type + fuel_type) maupun batch (rows).
    """
    if isinstance(data, LoadingBatchCalculateRequest) or hasattr(data, "rows"):
        total_fuel = sum(r.qty * r.fuel_cons for r in data.rows)
        total_prod = sum(r.qty * r.productivity for r in data.rows)
        if total_prod == 0:
            from fastapi import HTTPException
            raise HTTPException(status_code=422, detail="Total productivity tidak boleh 0")
        fuel_ratio = round(total_fuel / total_prod, 2)
        return LoadingBatchCalculateResponse(
            total_fuel=total_fuel,
            total_productivity=total_prod,
            fuel_ratio=fuel_ratio,
        )

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
