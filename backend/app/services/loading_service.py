from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.loading import Loading
from app.schemas.loading import LoadingCreate
from app.repositories import loading_repo
from app.services.equipment_service import get_by_unit_or_404
from app.services.fuel_service import get_by_type_or_404


# ─── Calculation Engine ───────────────────────────────────────────────────────

def _run_calculation_engine(db: Session, loading: Loading) -> None:
    """
    Calculation Engine — dipanggil otomatis saat loading disimpan.

    Rumus (SPO):
        fuel_cons    = equipment.qty × fuel_reference.average
        productivity = equipment.qty × equipment.productivity
        fuel_ratio   = round(fuel_cons / productivity, 2)
    """
    equipment = loading.equipment
    fuel_ref = loading.fuel_reference

    fuel_cons = equipment.qty * fuel_ref.average
    productivity = equipment.qty * equipment.productivity

    if productivity == 0:
        raise ValueError("Productivity tidak boleh 0, periksa data equipment.")

    fuel_ratio = round(fuel_cons / productivity, 2)

    loading_repo.save_summary(
        db=db,
        loading_id=loading.id,
        fuel_cons=fuel_cons,
        productivity=productivity,
        fuel_ratio=fuel_ratio,
    )


# ─── Public Service ───────────────────────────────────────────────────────────

def create_loading(db: Session, data: LoadingCreate) -> Loading:
    """
    1. Validasi equipment dan fuel_reference ada di master.
    2. Simpan record loading.
    3. Jalankan Calculation Engine secara otomatis.
    4. Return loading beserta summary.
    """
    # Validasi FK exists
    equipment = get_by_unit_or_404(db, data.equipment_id)
    fuel_ref = get_by_type_or_404(db, data.fuel_reference_id)

    # Simpan loading
    loading = loading_repo.create_loading(
        db=db,
        equipment_id=data.equipment_id,
        fuel_reference_id=data.fuel_reference_id,
    )

    # Pasang relasi agar engine bisa akses tanpa query tambahan
    loading.equipment = equipment
    loading.fuel_reference = fuel_ref

    # Jalankan engine
    try:
        _run_calculation_engine(db, loading)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Reload dengan summary
    return loading_repo.get_by_id(db, loading.id)


def get_all_loadings(db: Session) -> List[Loading]:
    return loading_repo.get_all(db)


def get_loading_or_404(db: Session, loading_id: int) -> Loading:
    obj = loading_repo.get_by_id(db, loading_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Loading id={loading_id} tidak ditemukan")
    return obj


def delete_loading(db: Session, loading_id: int) -> None:
    if not loading_repo.delete(db, loading_id):
        raise HTTPException(status_code=404, detail=f"Loading id={loading_id} tidak ditemukan")
