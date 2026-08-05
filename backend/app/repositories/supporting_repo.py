from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.supporting import Supporting, SupportingSummary


def create_supporting(
    db: Session,
    equipment_id: int,
    fuel_reference_id: int,
    pa: float = 0.90,
    ua: float = 0.53,
    ewh: float = 4121.0,
    total_mine_prod_bcm: float = 91276500.0,
    fuel_consumed_liters: float | None = None,
    operating_hours: float | None = None,
) -> Supporting:
    obj = Supporting(
        equipment_id=equipment_id,
        fuel_reference_id=fuel_reference_id,
        pa=pa,
        ua=ua,
        ewh=ewh,
        total_mine_prod_bcm=total_mine_prod_bcm,
        fuel_consumed_liters=fuel_consumed_liters,
        operating_hours=operating_hours,
        data_source="OPERATIONAL_ACTUAL" if fuel_consumed_liters is not None and operating_hours else "OEM_REFERENCE",
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def save_summary(
    db: Session,
    supporting_id: int,
    pa: float,
    ua: float,
    ewh: float,
    fuel_cons_lhr: float,
    total_fuel_liters: float,
    total_mine_prod_bcm: float,
    fuel_ratio: float,
    fuel_cons_reference: float | None = None,
    fuel_cons_actual: float | None = None,
    fuel_ratio_reference: float | None = None,
    fuel_ratio_actual: float | None = None,
    data_source: str = "OEM_REFERENCE",
) -> SupportingSummary:
    summary = db.query(SupportingSummary).filter(SupportingSummary.supporting_id == supporting_id).first()
    if not summary:
        summary = SupportingSummary(
            supporting_id=supporting_id,
            pa=pa,
            ua=ua,
            ewh=ewh,
            fuel_cons_lhr=fuel_cons_lhr,
            total_fuel_liters=total_fuel_liters,
            total_mine_prod_bcm=total_mine_prod_bcm,
            fuel_ratio=fuel_ratio,
            fuel_cons_reference=fuel_cons_reference,
            fuel_cons_actual=fuel_cons_actual,
            fuel_ratio_reference=fuel_ratio_reference,
            fuel_ratio_actual=fuel_ratio_actual,
            data_source=data_source,
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
        summary.fuel_cons_reference = fuel_cons_reference
        summary.fuel_cons_actual = fuel_cons_actual
        summary.fuel_ratio_reference = fuel_ratio_reference
        summary.fuel_ratio_actual = fuel_ratio_actual
        summary.data_source = data_source

    db.commit()
    db.refresh(summary)
    return summary


def get_by_id(db: Session, supporting_id: int) -> Optional[Supporting]:
    return db.query(Supporting).filter(Supporting.id == supporting_id).first()


def get_all(db: Session) -> List[Supporting]:
    return db.query(Supporting).all()


def delete(db: Session, supporting_id: int) -> bool:
    obj = get_by_id(db, supporting_id)
    if not obj:
        return False
    if obj.summary:
        db.delete(obj.summary)
    db.delete(obj)
    db.commit()
    return True
