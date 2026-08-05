from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.fuel_reference import FuelReference
from app.schemas.fuel_reference import FuelReferenceCreate, FuelReferenceUpdate


def create(db: Session, data: FuelReferenceCreate) -> FuelReference:
    obj = FuelReference(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_all(db: Session) -> List[FuelReference]:
    return db.query(FuelReference).all()


def get_by_id(db: Session, ref_id: int) -> Optional[FuelReference]:
    return db.query(FuelReference).filter(FuelReference.id == ref_id).first()


def get_by_type(db: Session, fuel_type: str) -> Optional[FuelReference]:
    """Cari fuel reference berdasarkan type (misal: 'PC200')."""
    return db.query(FuelReference).filter(FuelReference.type == fuel_type).first()


def update(db: Session, ref: FuelReference, data: FuelReferenceUpdate) -> FuelReference:
    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(ref, key, value)
    db.commit()
    db.refresh(ref)
    return ref


def delete(db: Session, ref: FuelReference) -> bool:
    db.delete(ref)
    db.commit()
    return True
