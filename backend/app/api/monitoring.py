from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.monitoring import OverviewResponse, ActivityResponse
from app.schemas.response import APIResponse, create_success_response
from app.services import monitoring_service

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.get("/overview", response_model=APIResponse[OverviewResponse])
def get_overview(db: Session = Depends(get_db)):
    """
    GET /api/v1/monitoring/overview — Ringkasan Eksekutif Monitoring (Unified API Envelope).
    """
    data = monitoring_service.get_overview_data(db)
    return create_success_response(
        data=data,
        message="Overview monitoring fuel ratio berhasil diambil."
    )


@router.get("/fuel-ratio/{activity}", response_model=APIResponse[ActivityResponse])
def get_fuel_ratio_by_activity(
    activity: str,
    from_date: Optional[str] = Query(default=None, alias="from", description="Format YYYY-MM-DD"),
    to_date: Optional[str] = Query(default=None, alias="to", description="Format YYYY-MM-DD"),
    contractor: Optional[str] = Query(default=None, description="Filter nama contractor"),
    unit: Optional[str] = Query(default=None, description="Filter tipe/nama unit"),
    db: Session = Depends(get_db),
):
    """
    GET /api/v1/monitoring/fuel-ratio/{activity} — Detail Monitoring per Aktivitas (Unified API Envelope).
    """
    valid_activities = {"loading", "hauling", "supporting", "dewatering"}
    if activity.lower() not in valid_activities:
        raise HTTPException(
            status_code=404,
            detail=f"Aktivitas '{activity}' tidak dikenal. Pilih dari: {', '.join(valid_activities)}"
        )

    start, end = None, None
    try:
        if from_date:
            start = date.fromisoformat(from_date)
        if to_date:
            end = date.fromisoformat(to_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="Filter tanggal harus berformat YYYY-MM-DD")

    if start and end and start > end:
        raise HTTPException(status_code=422, detail="Tanggal 'from' harus sebelum atau sama dengan tanggal 'to'")

    data = monitoring_service.get_activity_detail(
        db=db,
        activity=activity.lower(),
        contractor=contractor,
        unit=unit,
        from_date=start,
        to_date=end,
    )

    return create_success_response(
        data=data,
        message=f"Detail monitoring aktivitas '{activity}' berhasil diambil."
    )
