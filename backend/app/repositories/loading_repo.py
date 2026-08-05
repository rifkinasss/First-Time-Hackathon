from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.loading import Loading, LoadingSummary


def create_loading(db: Session, equipment_id: int, fuel_reference_id: int) -> Loading:
    obj = Loading(equipment_id=equipment_id, fuel_reference_id=fuel_reference_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def save_summary(
    db: Session,
    loading_id: int,
    fuel_cons: float,
    productivity: float,
    fuel_ratio: float,
) -> LoadingSummary:
    summary = LoadingSummary(
        loading_id=loading_id,
        fuel_cons=fuel_cons,
        productivity=productivity,
        fuel_ratio=fuel_ratio,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary


def get_all_with_summary(db: Session) -> List[Loading]:
    return (
        db.query(Loading)
        .options(
            joinedload(Loading.equipment),
            joinedload(Loading.fuel_reference),
            joinedload(Loading.summary),
        )
        .all()
    )


def get_by_id(db: Session, loading_id: int) -> Optional[Loading]:
    return (
        db.query(Loading)
        .options(
            joinedload(Loading.equipment),
            joinedload(Loading.fuel_reference),
            joinedload(Loading.summary),
        )
        .filter(Loading.id == loading_id)
        .first()
    )
