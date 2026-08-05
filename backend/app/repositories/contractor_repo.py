from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.contractor import Contractor
from app.schemas.contractor import ContractorCreate


def create(db: Session, data: ContractorCreate) -> Contractor:
    obj = Contractor(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_all(db: Session) -> List[Contractor]:
    return db.query(Contractor).order_by(Contractor.code).all()


def get_by_id(db: Session, contractor_id: int) -> Optional[Contractor]:
    return db.query(Contractor).filter(Contractor.id == contractor_id).first()


def get_by_code(db: Session, code: str) -> Optional[Contractor]:
    return db.query(Contractor).filter(Contractor.code == code).first()


def has_related_data(db: Session, contractor_id: int) -> bool:
    """Cek apakah contractor masih memiliki Equipment."""
    from app.models.equipment import Equipment
    has_eq = db.query(Equipment).filter(Equipment.contractor_id == contractor_id).first()
    return bool(has_eq)
