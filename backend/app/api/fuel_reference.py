from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.fuel_reference import FuelReferenceCreate, FuelReferenceResponse
from app.services import fuel_service

router = APIRouter(prefix="/fuel-references", tags=["Fuel References"])


@router.get("", response_model=List[FuelReferenceResponse])
def get_all_fuel_references(db: Session = Depends(get_db)):
    """GET /fuel-reference — List semua master fuel reference."""
    return fuel_service.get_all_fuel_references(db)


@router.post("", response_model=FuelReferenceResponse, status_code=201)
def create_fuel_reference(data: FuelReferenceCreate, db: Session = Depends(get_db)):
    """POST /fuel-reference — Tambah master fuel reference baru."""
    return fuel_service.create_fuel_reference(db, data)
