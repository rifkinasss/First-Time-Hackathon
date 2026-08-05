from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.fuel_reference import FuelReference
from app.schemas.fuel_reference import FuelReferenceCreate, FuelReferenceUpdate
from app.repositories import fuel_reference_repo


def create_fuel_reference(db: Session, data: FuelReferenceCreate) -> FuelReference:
    return fuel_reference_repo.create(db, data)


def get_all_fuel_references(db: Session) -> List[FuelReference]:
    return fuel_reference_repo.get_all(db)


def get_fuel_reference_or_404(db: Session, ref_id: int) -> FuelReference:
    obj = fuel_reference_repo.get_by_id(db, ref_id)
    if not obj:
        raise HTTPException(
            status_code=404,
            detail=f"Fuel Reference id={ref_id} tidak ditemukan."
        )
    return obj


def get_by_type_or_404(db: Session, fuel_type: str) -> FuelReference:
    """Cari fuel reference berdasarkan type. Raise 404 jika tidak ditemukan."""
    obj = fuel_reference_repo.get_by_type(db, fuel_type)
    if not obj:
        raise HTTPException(
            status_code=404,
            detail=f"Fuel Reference dengan type='{fuel_type}' tidak ditemukan di master."
        )
    return obj


def update_fuel_reference(db: Session, ref_id: int, data: FuelReferenceUpdate) -> FuelReference:
    ref = get_fuel_reference_or_404(db, ref_id)
    return fuel_reference_repo.update(db, ref, data)


def delete_fuel_reference(db: Session, ref_id: int) -> bool:
    ref = get_fuel_reference_or_404(db, ref_id)
    return fuel_reference_repo.delete(db, ref)
