import time
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.alignment import SPOAlignmentResponse, AlignmentSimulationRequest
from app.schemas.response import APIResponse, create_success_response
from app.services import alignment_service

router = APIRouter(prefix="/alignments", tags=["SPO Alignments"])


@router.get("/summary", response_model=APIResponse[SPOAlignmentResponse])
def get_alignment_summary(
    fuel_price: Optional[float] = Query(default=15000.0, description="Harga patokan bahan bakar per liter (IDR)"),
    target_bcm: Optional[float] = Query(default=None, description="Target produksi tambang (BCM)"),
    db: Session = Depends(get_db),
):
    """
    GET /api/v1/alignments/summary — Fitur 3: Penyelarasan Fuel Ratio & Pemakaian Fuel dengan SPO & Target Produksi.
    Menampilkan evaluasi selisih konsumsi fuel (liter), estimasi dampak biaya (IDR), gap produksi (BCM), dan aksi penyelarasan operasional.
    """
    t0 = time.perf_counter()
    data = alignment_service.calculate_spo_alignment(
        db=db,
        fuel_price_per_liter=fuel_price,
        target_production_bcm=target_bcm,
    )
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Hasil analisis penyelarasan SPO dan target produksi berhasil diproses.",
        execution_time_ms=elapsed_ms,
    )


@router.post("/simulate", response_model=APIResponse[SPOAlignmentResponse])
def simulate_alignment(req: AlignmentSimulationRequest):
    """
    POST /api/v1/alignments/simulate — Fitur 3: Simulasi Interaktif Penyelarasan SPO & Target Produksi.
    Memungkinkan tim manajemen memasukkan asumsi custom (fuel price, target BCM, SPO target FR) untuk mendapatkan rekomendasi instan.
    """
    t0 = time.perf_counter()
    data = alignment_service.simulate_spo_alignment(req)
    elapsed_ms = f"{(time.perf_counter() - t0) * 1000:.2f} ms"
    return create_success_response(
        data=data,
        message="Simulasi penyelarasan SPO berhasil diproses.",
        execution_time_ms=elapsed_ms,
    )
