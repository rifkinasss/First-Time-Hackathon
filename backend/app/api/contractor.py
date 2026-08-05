import time
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.contractor import (
    ContractorCreate,
    ContractorUpdate,
    ContractorResponse,
    ContractorPerformanceResponse,
    ContractorFuzzyRiskResponse,
)
from app.schemas.response import APIResponse, create_success_response
from app.services import contractor_service

router = APIRouter(prefix="/contractors", tags=["Contractors"])


@router.get("", response_model=APIResponse[List[ContractorResponse]])
def get_all_contractors(db: Session = Depends(get_db)):
    """GET /api/v1/contractors — List seluruh contractor."""
    t0 = time.perf_counter()
    data = contractor_service.get_all_contractors(db)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Master data kontraktor berhasil diambil.",
        total_count=len(data),
        execution_time_ms=elapsed_ms,
    )


@router.get("/performance", response_model=APIResponse[List[ContractorPerformanceResponse]])
def get_all_contractors_performance(db: Session = Depends(get_db)):
    """GET /api/v1/contractors/performance — Evaluasi performa seluruh kontraktor (Fitur 1 / Rule 1)."""
    t0 = time.perf_counter()
    data = contractor_service.evaluate_all_contractors_performance(db)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Evaluasi performa seluruh kontraktor berhasil diproses.",
        total_count=len(data),
        execution_time_ms=elapsed_ms,
    )


@router.get("/fuzzy-risk", response_model=APIResponse[List[ContractorFuzzyRiskResponse]])
def get_all_contractors_fuzzy_risk(db: Session = Depends(get_db)):
    """GET /api/v1/contractors/fuzzy-risk — Skor risiko Mamdani seluruh kontraktor."""
    t0 = time.perf_counter()
    data = contractor_service.evaluate_all_contractors_fuzzy_risk(db)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Skor risiko fuzzy Mamdani seluruh kontraktor berhasil diproses.",
        total_count=len(data),
        execution_time_ms=elapsed_ms,
    )


@router.get("/{contractor_id}/fuzzy-risk", response_model=APIResponse[ContractorFuzzyRiskResponse])
def get_contractor_fuzzy_risk(contractor_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/contractors/{id}/fuzzy-risk — Skor risiko Mamdani kontraktor."""
    t0 = time.perf_counter()
    data = contractor_service.evaluate_contractor_fuzzy_risk(db, contractor_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Skor risiko fuzzy Mamdani kontraktor {data['code']} berhasil diproses.",
        execution_time_ms=elapsed_ms,
    )


@router.post("", response_model=APIResponse[ContractorResponse], status_code=201)
def create_contractor(data: ContractorCreate, db: Session = Depends(get_db)):
    """POST /api/v1/contractors — Tambah contractor baru."""
    t0 = time.perf_counter()
    result = contractor_service.create_contractor(db, data)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message=f"Contractor '{result.company_name}' berhasil ditambahkan.",
        code=201,
        execution_time_ms=elapsed_ms,
    )


@router.get("/{contractor_id}", response_model=APIResponse[ContractorResponse])
def get_contractor(contractor_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/contractors/{id} — Detail contractor."""
    t0 = time.perf_counter()
    result = contractor_service.get_contractor_or_404(db, contractor_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message=f"Detail contractor id={contractor_id} berhasil diambil.",
        execution_time_ms=elapsed_ms,
    )


@router.put("/{contractor_id}", response_model=APIResponse[ContractorResponse])
def update_contractor(contractor_id: int, data: ContractorUpdate, db: Session = Depends(get_db)):
    """PUT /api/v1/contractors/{id} — Update data contractor."""
    t0 = time.perf_counter()
    result = contractor_service.update_contractor(db, contractor_id, data)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=result,
        message=f"Data contractor '{result.company_name}' berhasil diperbarui.",
        execution_time_ms=elapsed_ms,
    )


@router.delete("/{contractor_id}", response_model=APIResponse[dict])
def delete_contractor(contractor_id: int, db: Session = Depends(get_db)):
    """DELETE /api/v1/contractors/{id} — Hapus data contractor."""
    t0 = time.perf_counter()
    contractor_service.delete_contractor(db, contractor_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data={"contractor_id": contractor_id},
        message=f"Contractor id={contractor_id} berhasil dihapus.",
        execution_time_ms=elapsed_ms,
    )


@router.get("/{contractor_id}/performance", response_model=APIResponse[ContractorPerformanceResponse])
def get_contractor_performance(contractor_id: int, db: Session = Depends(get_db)):
    """GET /api/v1/contractors/{id}/performance — Detail evaluasi performa kontraktor spesifik (Fitur 1 / Rule 1)."""
    t0 = time.perf_counter()
    data = contractor_service.evaluate_contractor_performance(db, contractor_id)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message=f"Evaluasi performa kontraktor {data['code']} ({data['company_name']}) berhasil diproses.",
        execution_time_ms=elapsed_ms,
    )
