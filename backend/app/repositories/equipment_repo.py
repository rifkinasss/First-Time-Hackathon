from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.equipment import Equipment
from app.schemas.equipment import EquipmentCreate


def create(db: Session, data: EquipmentCreate) -> Equipment:
    obj = Equipment(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_all(db: Session) -> List[Equipment]:
    return db.query(Equipment).all()


def get_by_id(db: Session, equipment_id: int) -> Optional[Equipment]:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def get_by_unit(db: Session, unit_type: str) -> Optional[Equipment]:
    """Cari equipment berdasarkan unit_type (misal: 'EX26007')."""
    return db.query(Equipment).filter(Equipment.unit_type == unit_type).first()


def get_by_contractor(db: Session, contractor_id: int) -> List[Equipment]:
    """List semua equipment milik contractor tertentu."""
    return db.query(Equipment).filter(Equipment.contractor_id == contractor_id).all()
