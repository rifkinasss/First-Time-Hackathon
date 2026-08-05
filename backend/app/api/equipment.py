from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.equipment import EquipmentCreate, EquipmentResponse
from app.services import equipment_service

router = APIRouter(prefix="/equipments", tags=["Equipments"])


@router.get("", response_model=List[EquipmentResponse])
def get_all_equipment(db: Session = Depends(get_db)):
    """GET /equipment — List semua master equipment."""
    return equipment_service.get_all_equipment(db)


@router.post("", response_model=EquipmentResponse, status_code=201)
def create_equipment(data: EquipmentCreate, db: Session = Depends(get_db)):
    """POST /equipment — Tambah master equipment baru."""
    return equipment_service.create_equipment(db, data)
