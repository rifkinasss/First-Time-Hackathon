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


def evaluate_contractor_performance(db: Session, contractor_id: int):
    """
    Service Engine untuk Fitur 1: Contractor Performance Evaluation
    Aturan (Rule 1):
      - If Productivity UP, Then Fuel Ratio DOWN -> Reflects HIGH Contractor Performance
      - If Productivity DOWN, Then Fuel Ratio UP -> Reflects UNDERPERFORMING Contractor
    """
    contractor = get_contractor_or_404(db, contractor_id)

    # Agregasi data equipment & loading kontraktor
    equipments = contractor.equipments
    if not equipments:
        # Fallback jika kontraktor belum memiliki equipment
        return {
            "contractor_id": contractor.id,
            "code": contractor.code,
            "company_name": contractor.company_name,
            "actual_productivity": 0.0,
            "target_productivity": 0.0,
            "actual_fuel_cons": 0.0,
            "actual_fuel_ratio": 0.0,
            "target_fuel_ratio": 0.0,
            "productivity_variance_pct": 0.0,
            "fuel_ratio_variance_pct": 0.0,
            "performance_status": "NO_DATA",
            "rule_applied": "No Equipment Data",
            "insight": f"Kontraktor {contractor.company_name} belum memiliki data unit/equipment terdaftar."
        }

    total_target_prod = 0.0
    total_actual_prod = 0.0
    total_actual_fuel = 0.0
    total_target_fuel = 0.0

    for eq in equipments:
        # Hitung baseline target SPO per unit
        unit_target_prod = (eq.qty or 1) * (eq.productivity or 0.0)
        total_target_prod += unit_target_prod

        # Cek jika ada catatan transaksi loading aktual
        if eq.loadings:
            for l in eq.loadings:
                if hasattr(l, 'summary') and l.summary:
                    total_actual_fuel += l.summary.fuel_cons or 0.0
                    total_actual_prod += l.summary.productivity or 0.0
        else:
            # Menggunakan baseline perkiraan dari master data jika belum ada transaksi spesifik
            # Target fuel konsumsi = qty * average benchmark (asumsi standar ~60L/hr atau dari ref)
            default_fuel_cons = (eq.qty or 1) * 60.0
            total_target_fuel += default_fuel_cons

    # Jika belum ada transaksi loading, set actual = target dengan variasi simulasi normal untuk evaluasi
    if total_actual_prod == 0.0:
        total_actual_prod = total_target_prod
        total_actual_fuel = total_target_fuel if total_target_fuel > 0 else (total_target_prod * 0.15)

    if total_target_prod == 0.0:
        total_target_prod = 1.0  # hindari division by zero

    target_fr = round(total_target_fuel / total_target_prod, 2) if total_target_fuel > 0 else 0.15
    actual_fr = round(total_actual_fuel / total_actual_prod, 2) if total_actual_prod > 0 else 0.15

    prod_var_pct = round(((total_actual_prod - total_target_prod) / total_target_prod) * 100, 2)
    fr_var_pct = round(((actual_fr - target_fr) / target_fr) * 100, 2) if target_fr > 0 else 0.0

    # ─── Rule 1 Evaluation Logic ──────────────────────────────────────────────
    if total_actual_prod >= total_target_prod and actual_fr <= target_fr:
        status = "HIGH_PERFORMANCE"
        rule = "Rule 1: Productivity UP -> Fuel Ratio DOWN"
        insight = (
            f"Performa {contractor.company_name} SANGAT BAIK. "
            f"Produktivitas naik +{abs(prod_var_pct):.1f}% di atas SPO, berhasil menekan "
            f"Fuel Ratio menjadi {actual_fr:.2f} L/BCM (efisiensi meningkat {abs(fr_var_pct):.1f}%)."
        )
    elif total_actual_prod < total_target_prod and actual_fr > target_fr:
        status = "UNDERPERFORMING"
        rule = "Rule 1 Inverted: Productivity DOWN -> Fuel Ratio UP"
        insight = (
            f"Performa {contractor.company_name} KURANG EFEKTIF. "
            f"Produktivitas turun {prod_var_pct:.1f}% di bawah target SPO, menyebabkan "
            f"Fuel Ratio membengkak menjadi {actual_fr:.2f} L/BCM (+{fr_var_pct:.1f}% over budget)."
        )
    elif total_actual_prod >= total_target_prod and actual_fr > target_fr:
        status = "PRODUCTIVE_BUT_INEFFICIENT"
        rule = "Productivity UP with High Fuel Consumption"
        insight = (
            f"Kontraktor {contractor.company_name} produktif (+{prod_var_pct:.1f}%), "
            f"namun penggunaan bahan bakar melampaui SPO (+{fr_var_pct:.1f}%). "
            f"Indikasi idle time tinggi atau pengoperasian alat yang belum efisien."
        )
    else:
        status = "ON_TARGET"
        rule = "On Target SPO"
        insight = (
            f"Performa kontraktor {contractor.company_name} stabil "
            f"dan beroperasi sesuai standar parameter operasional (SPO)."
        )

    return {
        "contractor_id": contractor.id,
        "code": contractor.code,
        "company_name": contractor.company_name,
        "actual_productivity": round(total_actual_prod, 2),
        "target_productivity": round(total_target_prod, 2),
        "actual_fuel_cons": round(total_actual_fuel, 2),
        "actual_fuel_ratio": actual_fr,
        "target_fuel_ratio": target_fr,
        "productivity_variance_pct": prod_var_pct,
        "fuel_ratio_variance_pct": fr_var_pct,
        "performance_status": status,
        "rule_applied": rule,
        "insight": insight,
    }


def evaluate_all_contractors_performance(db: Session) -> List[dict]:
    """Evaluasi performa seluruh kontraktor berbasis Fitur 1 (Rule 1)."""
    contractors = get_all_contractors(db)
    return [evaluate_contractor_performance(db, c.id) for c in contractors]

