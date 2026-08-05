from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.hauling import Hauling, HaulingSummary


def create_hauling(db: Session, equipment_id: int, fuel_reference_id: int, distance_km: float = 3.90) -> Hauling:
    obj = Hauling(
        equipment_id=equipment_id,
        fuel_reference_id=fuel_reference_id,
        distance_km=distance_km,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def save_summary(
    db: Session,
    hauling_id: int,
    distance_km: float,
    fuel_cons: float,
    productivity: float,
    fuel_ratio: float,
) -> HaulingSummary:
    summary = db.query(HaulingSummary).filter(HaulingSummary.hauling_id == hauling_id).first()
    if not summary:
        summary = HaulingSummary(
            hauling_id=hauling_id,
            distance_km=distance_km,
            fuel_cons=fuel_cons,
            productivity=productivity,
            fuel_ratio=fuel_ratio,
        )
        db.add(summary)
    else:
        summary.distance_km = distance_km
        summary.fuel_cons = fuel_cons
        summary.productivity = productivity
        summary.fuel_ratio = fuel_ratio

    db.commit()
    db.refresh(summary)
    return summary


def get_by_id(db: Session, hauling_id: int) -> Optional[Hauling]:
    return db.query(Hauling).filter(Hauling.id == hauling_id).first()


def get_all(db: Session) -> List[Hauling]:
    return db.query(Hauling).all()


def delete(db: Session, hauling_id: int) -> bool:
    obj = get_by_id(db, hauling_id)
    if not obj:
        return False
    if obj.summary:
        db.delete(obj.summary)
    db.delete(obj)
    db.commit()
    return True
