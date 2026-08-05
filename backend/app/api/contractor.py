from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.contractor import (
    ContractorCreate,
    ContractorResponse,
    ContractorPerformanceResponse,
)
from app.schemas.response import APIResponse, create_success_response
from app.services import contractor_service

router = APIRouter(prefix="/contractors", tags=["Contractors"])


@router.get("", response_model=List[ContractorResponse])
def get_all_contractors(db: Session = Depends(get_db)):
    """GET /contractor — List seluruh contractor."""
    return contractor_service.get_all_contractors(db)


import time

@router.get("/performance", response_model=APIResponse[List[ContractorPerformanceResponse]])
def get_all_contractors_performance(db: Session = Depends(get_db)):
    """GET /contractors/performance — Evaluasi performa seluruh kontraktor (Fitur 1 / Rule 1)."""
    t0 = time.perf_counter()
    data = contractor_service.evaluate_all_contractors_performance(db)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Evaluasi performa seluruh kontraktor berhasil diproses.",
        total_count=len(data),
        execution_time_ms=elapsed_ms,
    )


@router.post("", response_model=ContractorResponse, status_code=201)
def create_contractor(data: ContractorCreate, db: Session = Depends(get_db)):
    """POST /contractors — Tambah contractor baru."""
    return contractor_service.create_contractor(db, data)


@router.get("/{contractor_id}", response_model=ContractorResponse)
def get_contractor(contractor_id: int, db: Session = Depends(get_db)):
    """GET /contractors/{id} — Detail contractor."""
    return contractor_service.get_contractor_or_404(db, contractor_id)


@router.get("/{contractor_id}/performance", response_model=APIResponse[ContractorPerformanceResponse])
def get_contractor_performance(contractor_id: int, db: Session = Depends(get_db)):
    """GET /contractors/{id}/performance — Detail evaluasi performa kontraktor spesifik (Fitur 1 / Rule 1)."""
    t0 = time.perf_counter()
    data = contractor_service.evaluate_contractor_performance(db, contractor_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Evaluasi performa kontraktor {data['code']} ({data['company_name']}) berhasil diproses.",
        execution_time_ms=elapsed_ms,
    )


