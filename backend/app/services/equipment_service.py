from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.equipment import Equipment
from app.schemas.equipment import EquipmentCreate
from app.repositories import equipment_repo


def create_equipment(db: Session, data: EquipmentCreate) -> Equipment:
    return equipment_repo.create(db, data)


def get_all_equipment(db: Session) -> List[Equipment]:
    return equipment_repo.get_all(db)


def get_by_unit_or_404(db: Session, unit_type: str) -> Equipment:
    """Cari equipment berdasarkan unit_type. Raise 404 jika tidak ditemukan."""
    obj = equipment_repo.get_by_unit(db, unit_type)
    if not obj:
        raise HTTPException(
            status_code=404,
            detail=f"Equipment dengan unit_type='{unit_type}' tidak ditemukan di master."
        )
    return obj
