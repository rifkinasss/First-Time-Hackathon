from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.hauling import Hauling
from app.schemas.hauling import HaulingCreate
from app.repositories import hauling_repo, hauling_distance_ref_repo
from app.services.equipment_service import get_by_unit_or_404
from app.services.fuel_service import get_by_type_or_404


def _run_calculation_engine(db: Session, hauling: Hauling) -> None:
    """
    Calculation Engine Hauling — dipanggil otomatis saat transaksi hauling disimpan.

    Rumus:
        1. bcm_per_hr  = Lookup dari HaulingDistanceRef berdasarkan hauling.distance_km
        2. fuel_cons    = equipment.qty × fuel_reference.average
        3. productivity = equipment.qty × bcm_per_hr
        4. fuel_ratio   = round(fuel_cons / productivity, 2)
    """
    equipment = hauling.equipment
    fuel_ref = hauling.fuel_reference

    # Lookup BCM/HR berdasarkan distance_km
    dist_ref = hauling_distance_ref_repo.get_by_km(db, hauling.distance_km)
    if not dist_ref:
        bcm_per_hr = equipment.productivity if equipment.productivity > 0 else 110.0
    else:
        bcm_per_hr = dist_ref.bcm_per_hr

    fuel_cons = equipment.qty * fuel_ref.average
    productivity = equipment.qty * bcm_per_hr

    if productivity == 0:
        raise ValueError("Productivity tidak boleh 0, periksa data equipment/jarak.")

    fuel_ratio = round(fuel_cons / productivity, 2)

    hauling_repo.save_summary(
        db=db,
        hauling_id=hauling.id,
        distance_km=hauling.distance_km,
        fuel_cons=fuel_cons,
        productivity=productivity,
        fuel_ratio=fuel_ratio,
    )


def create_hauling(db: Session, data: HaulingCreate) -> Hauling:
    """
    1. Validasi equipment dan fuel_reference ada.
    2. Simpan record hauling (lengkap dengan distance_km).
    3. Jalankan Calculation Engine secara otomatis.
    4. Return hauling beserta summary.
    """
    equipment = db.query(hauling_repo.Equipment if hasattr(hauling_repo, 'Equipment') else equipment_service_get_eq(db, data.equipment_id)).first() if False else None
    
    # Get objects via DB query directly to avoid circular imports
    from app.models.equipment import Equipment
    from app.models.fuel_reference import FuelReference
    
    eq_obj = db.query(Equipment).filter(Equipment.id == data.equipment_id).first()
    if not eq_obj:
        raise HTTPException(status_code=404, detail=f"Equipment id={data.equipment_id} tidak ditemukan")

    fr_obj = db.query(FuelReference).filter(FuelReference.id == data.fuel_reference_id).first()
    if not fr_obj:
        raise HTTPException(status_code=404, detail=f"Fuel Reference id={data.fuel_reference_id} tidak ditemukan")

    hauling = hauling_repo.create_hauling(
        db=db,
        equipment_id=data.equipment_id,
        fuel_reference_id=data.fuel_reference_id,
        distance_km=data.distance_km,
    )

    hauling.equipment = eq_obj
    hauling.fuel_reference = fr_obj

    try:
        _run_calculation_engine(db, hauling)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return hauling_repo.get_by_id(db, hauling.id)


def get_all_haulings(db: Session) -> List[Hauling]:
    return hauling_repo.get_all(db)


def get_hauling_or_404(db: Session, hauling_id: int) -> Hauling:
    obj = hauling_repo.get_by_id(db, hauling_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Hauling id={hauling_id} tidak ditemukan")
    return obj


def delete_hauling(db: Session, hauling_id: int) -> None:
    if not hauling_repo.delete(db, hauling_id):
        raise HTTPException(status_code=404, detail=f"Hauling id={hauling_id} tidak ditemukan")
