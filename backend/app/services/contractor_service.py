from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.contractor import Contractor
from app.schemas.contractor import ContractorCreate
from app.repositories import contractor_repo


def create_contractor(db: Session, data: ContractorCreate) -> Contractor:
    existing = contractor_repo.get_by_code(db, data.code)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Contractor dengan code '{data.code}' sudah ada."
        )
    return contractor_repo.create(db, data)


def get_all_contractors(db: Session) -> List[Contractor]:
    return contractor_repo.get_all(db)


def get_contractor_or_404(db: Session, contractor_id: int) -> Contractor:
    obj = contractor_repo.get_by_id(db, contractor_id)
    if not obj:
        raise HTTPException(
            status_code=404,
            detail=f"Contractor id={contractor_id} tidak ditemukan."
        )
    return obj
