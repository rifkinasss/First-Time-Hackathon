from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.supporting import Supporting
from app.schemas.supporting import SupportingCreate
from app.repositories import supporting_repo


def _run_calculation_engine(db: Session, supporting: Supporting) -> None:
    """
    Calculation Engine Supporting — dipanggil otomatis saat transaksi supporting disimpan.

    Rumus:
        1. fuel_cons_lhr     = actual_liters / operating_hours, jika actual tersedia
        2. total_fuel_liters = actual_liters, jika actual tersedia
        3. fuel_ratio        = round(total_fuel_liters / total_mine_prod_bcm, 4)
    """
    equipment = supporting.equipment
    fuel_ref = supporting.fuel_reference

    qty = equipment.qty if equipment.qty > 0 else 1
    pa = supporting.pa
    ua = supporting.ua
    ewh = supporting.ewh
    total_mine_prod = supporting.total_mine_prod_bcm

    fuel_cons_reference = qty * fuel_ref.average
    fuel_ratio_reference = round((qty * pa * ua * ewh * fuel_ref.average) / total_mine_prod, 4)
    has_actual = supporting.fuel_consumed_liters is not None and supporting.operating_hours is not None
    fuel_cons_actual = supporting.fuel_consumed_liters / supporting.operating_hours if has_actual else None
    fuel_cons_lhr = fuel_cons_actual if fuel_cons_actual is not None else fuel_cons_reference
    total_fuel_liters = supporting.fuel_consumed_liters if has_actual else qty * pa * ua * ewh * fuel_ref.average

    if total_mine_prod == 0:
        raise ValueError("Total Mine Production BCM tidak boleh 0.")

    # Hitung fuel ratio per BCM total tambang
    fuel_ratio = round(total_fuel_liters / total_mine_prod, 4)

    supporting_repo.save_summary(
        db=db,
        supporting_id=supporting.id,
        pa=pa,
        ua=ua,
        ewh=ewh,
        fuel_cons_lhr=fuel_cons_lhr,
        total_fuel_liters=total_fuel_liters,
        total_mine_prod_bcm=total_mine_prod,
        fuel_ratio=fuel_ratio,
        fuel_cons_reference=fuel_cons_reference,
        fuel_cons_actual=fuel_cons_actual,
        fuel_ratio_reference=fuel_ratio_reference,
        fuel_ratio_actual=fuel_ratio if has_actual else None,
        data_source="OPERATIONAL_ACTUAL" if has_actual else "OEM_REFERENCE",
    )


def create_supporting(db: Session, data: SupportingCreate) -> Supporting:
    from app.models.equipment import Equipment
    from app.models.fuel_reference import FuelReference

    eq_obj = db.query(Equipment).filter(Equipment.id == data.equipment_id).first()
    if not eq_obj:
        raise HTTPException(status_code=404, detail=f"Equipment id={data.equipment_id} tidak ditemukan")

    fr_obj = db.query(FuelReference).filter(FuelReference.id == data.fuel_reference_id).first()
    if not fr_obj:
        raise HTTPException(status_code=404, detail=f"Fuel Reference id={data.fuel_reference_id} tidak ditemukan")

    supporting = supporting_repo.create_supporting(
        db=db,
        equipment_id=data.equipment_id,
        fuel_reference_id=data.fuel_reference_id,
        pa=data.pa,
        ua=data.ua,
        ewh=data.ewh,
        total_mine_prod_bcm=data.total_mine_prod_bcm,
        fuel_consumed_liters=data.fuel_consumed_liters,
        operating_hours=data.operating_hours,
    )

    supporting.equipment = eq_obj
    supporting.fuel_reference = fr_obj

    try:
        _run_calculation_engine(db, supporting)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return supporting_repo.get_by_id(db, supporting.id)


def get_all_supportings(db: Session) -> List[Supporting]:
    return supporting_repo.get_all(db)


def get_supporting_or_404(db: Session, supporting_id: int) -> Supporting:
    obj = supporting_repo.get_by_id(db, supporting_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Supporting id={supporting_id} tidak ditemukan")
    return obj


def delete_supporting(db: Session, supporting_id: int) -> None:
    if not supporting_repo.delete(db, supporting_id):
        raise HTTPException(status_code=404, detail=f"Supporting id={supporting_id} tidak ditemukan")


def auto_calculate_all_supporting(
    db: Session,
    pa: float = 0.90,
    ua: float = 0.53,
    ewh: float = 4121.0,
    total_mine_prod_bcm: float = 91276500.0,
    fuel_consumed_liters: float | None = None,
    operating_hours: float | None = None,
):
    """
    Kalkulasi otomatis secara BATCH untuk SEMUA unit equipment yang ber-activity 'Supporting'.
    Mengambil unit_type dan otomatis mencocokkan Ref Fuel-nya.
    """
    from app.models.equipment import Equipment
    from app.models.fuel_reference import FuelReference
    from app.schemas.supporting import SupportingSummaryDetailResponse

    supporting_eqs = db.query(Equipment).filter(Equipment.activity == "Supporting").all()
    if not supporting_eqs:
        raise HTTPException(status_code=404, detail="Tidak ada equipment dengan activity 'Supporting' di master data.")

    processed_details = []
    sum_total_liters = 0.0

    for eq in supporting_eqs:
        # Match fuel ref dynamically
        fr = db.query(FuelReference).filter(FuelReference.type.like(f"%{eq.unit_type}%")).first()
        if not fr:
            fr = db.query(FuelReference).filter(FuelReference.merk.like(f"%{eq.unit_type}%")).first()
        if not fr:
            fr = db.query(FuelReference).filter(FuelReference.activity.in_(["SUPPORT", "Supporting"])).first()

        if not fr:
            continue

        # Save or update transaction
        create_data = SupportingCreate(
            equipment_id=eq.id,
            fuel_reference_id=fr.id,
            pa=pa,
            ua=ua,
            ewh=ewh,
            total_mine_prod_bcm=total_mine_prod_bcm,
            fuel_consumed_liters=fuel_consumed_liters,
            operating_hours=operating_hours,
        )
        sup_obj = create_supporting(db, create_data)

        if sup_obj.summary:
            sum_total_liters += sup_obj.summary.total_fuel_liters
            processed_details.append(
                SupportingSummaryDetailResponse(
                    id=sup_obj.summary.id,
                    supporting_id=sup_obj.id,
                    unit_type=eq.unit_type,
                    fuel_type=fr.type,
                    pa=sup_obj.summary.pa,
                    ua=sup_obj.summary.ua,
                    ewh=sup_obj.summary.ewh,
                    fuel_cons_lhr=sup_obj.summary.fuel_cons_lhr,
                    total_fuel_liters=sup_obj.summary.total_fuel_liters,
                    total_mine_prod_bcm=sup_obj.summary.total_mine_prod_bcm,
                    fuel_ratio=sup_obj.summary.fuel_ratio,
                    created_at=sup_obj.summary.created_at,
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
