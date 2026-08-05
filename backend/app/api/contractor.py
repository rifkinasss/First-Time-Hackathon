from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.contractor import ContractorCreate, ContractorResponse
from app.services import contractor_service

router = APIRouter(prefix="/contractor", tags=["Contractor"])


@router.get("", response_model=List[ContractorResponse])
def get_all_contractors(db: Session = Depends(get_db)):
    """GET /contractor — List seluruh contractor."""
    return contractor_service.get_all_contractors(db)


@router.post("", response_model=ContractorResponse, status_code=201)
def create_contractor(data: ContractorCreate, db: Session = Depends(get_db)):
    """POST /contractor — Tambah contractor baru."""
    return contractor_service.create_contractor(db, data)


@router.get("/{contractor_id}", response_model=ContractorResponse)
def get_contractor(contractor_id: int, db: Session = Depends(get_db)):
    """GET /contractor/{id} — Detail contractor."""
    return contractor_service.get_contractor_or_404(db, contractor_id)
