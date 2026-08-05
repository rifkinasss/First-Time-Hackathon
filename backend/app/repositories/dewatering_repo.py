from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.dewatering import Dewatering, DewateringSummary


def create_dewatering(
    db: Session,
    equipment_id: int,
    fuel_reference_id: int,
    pa: float = 0.90,
    ua: float = 0.63,
    ewh: float = 4899.0,
    total_mine_prod_bcm: float = 91276500.0,
) -> Dewatering:
    obj = Dewatering(
        equipment_id=equipment_id,
        fuel_reference_id=fuel_reference_id,
        pa=pa,
        ua=ua,
        ewh=ewh,
        total_mine_prod_bcm=total_mine_prod_bcm,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def save_summary(
    db: Session,
    dewatering_id: int,
    pa: float,
    ua: float,
    ewh: float,
    fuel_cons_lhr: float,
    total_fuel_liters: float,
    total_mine_prod_bcm: float,
    fuel_ratio: float,
) -> DewateringSummary:
    summary = db.query(DewateringSummary).filter(DewateringSummary.dewatering_id == dewatering_id).first()
    if not summary:
        summary = DewateringSummary(
            dewatering_id=dewatering_id,
            pa=pa,
            ua=ua,
            ewh=ewh,
            fuel_cons_lhr=fuel_cons_lhr,
            total_fuel_liters=total_fuel_liters,
            total_mine_prod_bcm=total_mine_prod_bcm,
            fuel_ratio=fuel_ratio,
        )
        db.add(summary)
    else:
        summary.pa = pa
        summary.ua = ua
        summary.ewh = ewh
        summary.fuel_cons_lhr = fuel_cons_lhr
        summary.total_fuel_liters = total_fuel_liters
        summary.total_mine_prod_bcm = total_mine_prod_bcm
        summary.fuel_ratio = fuel_ratio

    db.commit()
    db.refresh(summary)
    return summary


def get_by_id(db: Session, dewatering_id: int) -> Optional[Dewatering]:
    return db.query(Dewatering).filter(Dewatering.id == dewatering_id).first()


def get_all(db: Session) -> List[Dewatering]:
    return db.query(Dewatering).all()


def delete(db: Session, dewatering_id: int) -> bool:
    obj = get_by_id(db, dewatering_id)
    if not obj:
        return False
    if obj.summary:
        db.delete(obj.summary)
    db.delete(obj)
    db.commit()
    return True
