import re
from difflib import SequenceMatcher
from typing import Dict, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.equipment import Equipment
from app.models.fuel_reference import FuelReference
from app.models.loading import Loading, LoadingSummary
from app.schemas.loading import LoadingCreate
from app.repositories import loading_repo
from app.services.equipment_service import get_equipment_or_404
from app.services.fuel_service import get_fuel_reference_or_404


# ─── Calculation Engine ───────────────────────────────────────────────────────

def _run_calculation_engine(db: Session, loading: Loading) -> None:
    """
    Calculation Engine — dipanggil otomatis saat loading disimpan.

    Rumus:
        fuel_cons_reference = equipment.qty × fuel_reference.average
        fuel_cons_actual    = loading.fuel_consumed_liters (jika tersedia)
        fuel_cons            = actual atau reference sebagai fallback
        productivity         = equipment.qty × equipment.productivity
        fuel_ratio           = fuel_cons / productivity
    """
    equipment = loading.equipment
    fuel_ref = loading.fuel_reference

    if equipment is None or fuel_ref is None:
        raise ValueError("Equipment dan fuel reference wajib tersedia.")
    if equipment.activity.upper() != "LOADING":
        raise ValueError("Equipment yang diproses harus memiliki activity='Loading'.")
    if equipment.qty <= 0 or equipment.productivity is None or equipment.productivity <= 0:
        raise ValueError("Qty dan productivity Loading harus lebih dari 0.")
    if fuel_ref.activity.upper() != "LOADING":
        raise ValueError("Fuel reference yang diproses harus memiliki activity='Loading'.")

    fuel_cons_reference = equipment.qty * fuel_ref.average
    productivity = equipment.qty * equipment.productivity

    if productivity == 0:
        raise ValueError("Productivity tidak boleh 0, periksa data equipment.")

    has_actual = (
        loading.fuel_consumed_liters is not None
        and loading.operating_hours is not None
        and loading.fuel_consumed_liters > 0
        and loading.operating_hours > 0
    )
    fuel_cons_actual = (
        loading.fuel_consumed_liters / loading.operating_hours
        if has_actual
        else None
    )
    fuel_cons = fuel_cons_actual if fuel_cons_actual is not None else fuel_cons_reference
    fuel_ratio_reference = round(fuel_cons_reference / productivity, 2)
    fuel_ratio_actual = round(fuel_cons_actual / productivity, 2) if fuel_cons_actual is not None else None
    fuel_ratio = fuel_ratio_actual if fuel_ratio_actual is not None else fuel_ratio_reference
    data_source = "OPERATIONAL_ACTUAL" if has_actual else "OEM_REFERENCE"

    if loading.summary is None:
        loading.summary = LoadingSummary(
            fuel_cons=fuel_cons,
            productivity=productivity,
            fuel_ratio=fuel_ratio,
            fuel_cons_reference=fuel_cons_reference,
            fuel_cons_actual=fuel_cons_actual,
            fuel_ratio_reference=fuel_ratio_reference,
            fuel_ratio_actual=fuel_ratio_actual,
            data_source=data_source,
        )
    else:
        loading.summary.fuel_cons = fuel_cons
        loading.summary.productivity = productivity
        loading.summary.fuel_ratio = fuel_ratio
        loading.summary.fuel_cons_reference = fuel_cons_reference
        loading.summary.fuel_cons_actual = fuel_cons_actual
        loading.summary.fuel_ratio_reference = fuel_ratio_reference
        loading.summary.fuel_ratio_actual = fuel_ratio_actual
        loading.summary.data_source = data_source
    db.flush()


# ─── Public Service ───────────────────────────────────────────────────────────

def create_loading(db: Session, data: LoadingCreate) -> Loading:
    """
    1. Validasi equipment dan fuel_reference ada di master.
    2. Simpan record loading.
    3. Jalankan Calculation Engine secara otomatis.
    4. Return loading beserta summary.
    """
    # Validasi FK exists
    equipment = get_equipment_or_404(db, data.equipment_id)
    fuel_ref = get_fuel_reference_or_404(db, data.fuel_reference_id)

    # Simpan loading
    loading = loading_repo.create_loading(
        db=db,
        equipment_id=data.equipment_id,
        fuel_reference_id=data.fuel_reference_id,
        fuel_consumed_liters=data.fuel_consumed_liters,
        operating_hours=data.operating_hours,
    )

    # Pasang relasi agar engine bisa akses tanpa query tambahan
    loading.equipment = equipment
    loading.fuel_reference = fuel_ref

    # Jalankan engine
    try:
        _run_calculation_engine(db, loading)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=str(e))

    # Reload dengan summary
    db.commit()
    return loading_repo.get_by_id(db, loading.id)


def _normalize_reference_text(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", str(value).upper())


def _choose_loading_reference(
    unit_type: str, references: List[FuelReference]
) -> FuelReference:
    """Pilih referensi Loading paling cocok dengan unit_type.

    Master saat ini belum memiliki FK equipment -> fuel_reference. Karena itu
    backfill memakai pencocokan merk/type yang deterministik dan hanya menerima
    hasil dengan skor minimal; selain itu digunakan median referensi Loading.
    """
    unit_key = _normalize_reference_text(unit_type)
    scored = []
    for ref in references:
        keys = [_normalize_reference_text(ref.merk), _normalize_reference_text(ref.type)]
        exact = max((1.0 if unit_key == key else 0.0 for key in keys), default=0.0)
        contains = max(
            (0.95 if unit_key in key or key in unit_key else 0.0 for key in keys),
            default=0.0,
        )
        similarity = max(SequenceMatcher(None, unit_key, key).ratio() for key in keys)
        scored.append((max(exact, contains, similarity * 0.8), ref))

    score, selected = max(scored, key=lambda item: item[0])
    if score >= 0.70:
        return selected

    # Conservative fallback: median activity reference, not another activity.
    averages = sorted(ref.average for ref in references)
    median_average = averages[len(averages) // 2]
    return min(references, key=lambda ref: abs(ref.average - median_average))


def backfill_loading_summaries(
    db: Session,
    demo_actuals: bool = False,
) -> Dict[str, int]:
    """Buat atau perbarui Loading dan LoadingSummary dari master data.

    Proses ini idempotent: menjalankannya berulang kali tidak membuat transaksi
    Loading duplikat. Satu equipment Loading memiliki satu summary terbaru.
    `demo_actuals=True` hanya dipakai oleh seeder untuk membuat data simulasi
    operasional yang berbeda dari OEM average; data produksi harus mengisi
    `fuel_consumed_liters` dan `operating_hours` dari pengukuran lapangan.
    """
    equipment_rows = (
        db.query(Equipment)
        .filter(Equipment.activity.ilike("loading"))
        .filter(Equipment.qty > 0)
        .filter(Equipment.productivity.isnot(None))
        .filter(Equipment.productivity > 0)
        .all()
    )
    references = (
        db.query(FuelReference)
        .filter(FuelReference.activity.ilike("loading"))
        .all()
    )
    if not references:
        raise ValueError("Fuel reference Loading belum tersedia.")

    created = 0
    updated = 0
    for equipment in equipment_rows:
        loading = (
            db.query(Loading)
            .filter(Loading.equipment_id == equipment.id)
            .order_by(Loading.id.desc())
            .first()
        )
        if loading is None:
            loading = Loading(
                equipment=equipment,
                fuel_reference=_choose_loading_reference(equipment.unit_type, references),
            )
            db.add(loading)
            db.flush()
            created += 1
        elif loading.summary is None:
            updated += 1
        else:
            updated += 1

        if demo_actuals and loading.fuel_consumed_liters is None:
            hours = 12.0
            deviation_factors = [0.88, 0.96, 1.00, 1.08, 1.18]
            factor = deviation_factors[equipment.id % len(deviation_factors)]
            loading.operating_hours = hours
            loading.fuel_consumed_liters = round(
                equipment.qty * loading.fuel_reference.average * hours * factor,
                2,
            )

        _run_calculation_engine(db, loading)

    db.commit()
    return {
        "equipment_processed": len(equipment_rows),
        "loading_created": created,
        "summary_created_or_updated": updated + created,
    }


def get_all_loadings(db: Session) -> List[Loading]:
    return loading_repo.get_all_with_summary(db)


def get_all_summaries(db: Session) -> List[Loading]:
    return loading_repo.get_all_with_summary(db)


def get_loading_or_404(db: Session, loading_id: int) -> Loading:
    obj = loading_repo.get_by_id(db, loading_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Loading id={loading_id} tidak ditemukan")
    return obj


def delete_loading(db: Session, loading_id: int) -> bool:
    loading = get_loading_or_404(db, loading_id)
    return loading_repo.delete_loading(db, loading)
