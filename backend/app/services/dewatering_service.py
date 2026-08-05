from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.dewatering import Dewatering
from app.schemas.dewatering import DewateringCreate
from app.repositories import dewatering_repo


def _run_calculation_engine(db: Session, dewatering: Dewatering) -> None:
    """
    Calculation Engine Dewatering — dipanggil otomatis saat transaksi dewatering disimpan.

    Rumus:
        1. fuel_cons_lhr     = equipment.qty × fuel_reference.average (L/hr)
        2. total_fuel_liters = equipment.qty × pa × ua × ewh × fuel_reference.average (Liter)
        3. fuel_ratio        = round(total_fuel_liters / total_mine_prod_bcm, 4)
    """
    equipment = dewatering.equipment
    fuel_ref = dewatering.fuel_reference

    qty = equipment.qty if equipment.qty > 0 else 1
    pa = dewatering.pa
    ua = dewatering.ua
    ewh = dewatering.ewh
    total_mine_prod = dewatering.total_mine_prod_bcm

    fuel_cons_lhr = qty * fuel_ref.average
    total_fuel_liters = qty * pa * ua * ewh * fuel_ref.average

    if total_mine_prod == 0:
        raise ValueError("Total Mine Production BCM tidak boleh 0.")

    fuel_ratio = round(total_fuel_liters / total_mine_prod, 4)

    dewatering_repo.save_summary(
        db=db,
        dewatering_id=dewatering.id,
        pa=pa,
        ua=ua,
        ewh=ewh,
        fuel_cons_lhr=fuel_cons_lhr,
        total_fuel_liters=total_fuel_liters,
        total_mine_prod_bcm=total_mine_prod,
        fuel_ratio=fuel_ratio,
    )


def create_dewatering(db: Session, data: DewateringCreate) -> Dewatering:
    from app.models.equipment import Equipment
    from app.models.fuel_reference import FuelReference

    eq_obj = db.query(Equipment).filter(Equipment.id == data.equipment_id).first()
    if not eq_obj:
        raise HTTPException(status_code=404, detail=f"Equipment id={data.equipment_id} tidak ditemukan")

    fr_obj = db.query(FuelReference).filter(FuelReference.id == data.fuel_reference_id).first()
    if not fr_obj:
        raise HTTPException(status_code=404, detail=f"Fuel Reference id={data.fuel_reference_id} tidak ditemukan")

    dewatering = dewatering_repo.create_dewatering(
        db=db,
        equipment_id=data.equipment_id,
        fuel_reference_id=data.fuel_reference_id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
    )

    dewatering.equipment = eq_obj
    dewatering.fuel_reference = fr_obj

    try:
        _run_calculation_engine(db, dewatering)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return dewatering_repo.get_by_id(db, dewatering.id)


def auto_calculate_all_dewatering(
    db: Session,
    pa: float = 0.90,
    ua: float = 0.63,
    ewh: float = 4899.0,
    total_mine_prod_bcm: float = 91276500.0,
):
    """
    Kalkulasi otomatis secara BATCH untuk SEMUA unit equipment yang ber-activity 'Dewatering'.
    Mengambil unit_type dari Master Equipment dan otomatis mencocokkan Ref Fuel-nya.
    """
    from app.models.equipment import Equipment
    from app.models.fuel_reference import FuelReference
    from app.schemas.dewatering import DewateringSummaryDetailResponse

    dewatering_eqs = db.query(Equipment).filter(Equipment.activity == "Dewatering").all()
    if not dewatering_eqs:
        raise HTTPException(status_code=404, detail="Tidak ada equipment dengan activity 'Dewatering' di master data.")

    processed_details = []
    sum_total_liters = 0.0

    for eq in dewatering_eqs:
        # Match fuel ref dynamically (pump / dewatering keywords)
        fr = db.query(FuelReference).filter(FuelReference.type.like(f"%{eq.unit_type}%")).first()
        if not fr:
            fr = db.query(FuelReference).filter(FuelReference.merk.like(f"%{eq.unit_type}%")).first()
        if not fr:
            fr = db.query(FuelReference).filter(FuelReference.type.like("%Pump%")).first()
        if not fr:
            fr = db.query(FuelReference).filter(FuelReference.activity.in_(["SUPPORT", "Dewatering"])).first()

        if not fr:
            continue

        create_data = DewateringCreate(
            equipment_id=eq.id,
            fuel_reference_id=fr.id,
            pa=pa,
            ua=ua,
            ewh=ewh,
            total_mine_prod_bcm=total_mine_prod_bcm,
        )
        dew_obj = create_dewatering(db, create_data)

        if dew_obj.summary:
            sum_total_liters += dew_obj.summary.total_fuel_liters
            processed_details.append(
                DewateringSummaryDetailResponse(
                    id=dew_obj.summary.id,
                    dewatering_id=dew_obj.id,
                    unit_type=eq.unit_type,
                    fuel_type=fr.type,
                    pa=dew_obj.summary.pa,
                    ua=dew_obj.summary.ua,
                    ewh=dew_obj.summary.ewh,
                    fuel_cons_lhr=dew_obj.summary.fuel_cons_lhr,
                    total_fuel_liters=dew_obj.summary.total_fuel_liters,
                    total_mine_prod_bcm=dew_obj.summary.total_mine_prod_bcm,
                    fuel_ratio=dew_obj.summary.fuel_ratio,
                    created_at=dew_obj.summary.created_at,
                )
            )

    overall_fuel_ratio = round(sum_total_liters / total_mine_prod_bcm, 4)

    return {
        "total_units_processed": len(processed_details),
        "total_fuel_liters": round(sum_total_liters, 2),
        "total_mine_prod_bcm": total_mine_prod_bcm,
        "overall_fuel_ratio": overall_fuel_ratio,
        "details": processed_details,
    }


def get_all_dewaterings(db: Session) -> List[Dewatering]:
    return dewatering_repo.get_all(db)


def get_dewatering_or_404(db: Session, dewatering_id: int) -> Dewatering:
    obj = dewatering_repo.get_by_id(db, dewatering_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Dewatering id={dewatering_id} tidak ditemukan")
    return obj


def delete_dewatering(db: Session, dewatering_id: int) -> None:
    if not dewatering_repo.delete(db, dewatering_id):
        raise HTTPException(status_code=404, detail=f"Dewatering id={dewatering_id} tidak ditemukan")
