from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.contractor import Contractor
from app.schemas.contractor import (
    ContractorCreate,
    ContractorActivityFuelRatio,
    ContractorEquipmentFuelRatio,
)
from app.repositories import contractor_repo
from app.fuzzy_engine import infer_mamdani

ACTIVITY_CONFIGS: Dict[str, Dict[str, Any]] = {
    "loading": {"label": "Loading", "spo_fr": 0.1325},
    "hauling": {"label": "Hauling", "spo_fr": 0.6007},
    "supporting": {"label": "Supporting", "spo_fr": 0.1879},
    "dewatering": {"label": "Dewatering", "spo_fr": 0.3233},
}

HOURS_PER_YEAR = 24 * 360
TOTAL_ANNUAL_PRODUCTION_BCM = 1.05 * 86_930_000


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


def _latest_relation(records):
    return max(records, key=lambda record: record.id) if records else None


def _build_fuzzy_snapshot(contractor: Contractor) -> dict:
    """Build Mamdani inputs from one contractor's current equipment snapshot."""
    loading_productivity = []
    loading_qty = []
    loading_actual = loading_reference = 0.0
    support_dew_population = 0
    support_dew_fuel = support_dew_reference = 0.0

    for equipment in contractor.equipments:
        qty = equipment.qty or 0
        loading = _latest_relation(equipment.loadings)
        supporting = _latest_relation(equipment.supportings)
        dewatering = _latest_relation(equipment.dewaterings)

        if (equipment.activity or "").upper() == "LOADING" and equipment.productivity and equipment.productivity > 0:
            loading_productivity.append(equipment.productivity * qty)
            loading_qty.append(qty)
            if loading:
                reference = (loading.summary.fuel_cons_reference if loading.summary else 0.0) or qty * loading.fuel_reference.average
                actual = (loading.summary.fuel_cons_actual if loading.summary else None) or reference
                loading_reference += reference
                loading_actual += actual
            continue

        if (equipment.activity or "").upper() in {"SUPPORTING", "DEWATERING"}:
            support_dew_population += qty
            relation = supporting or dewatering
            if relation:
                reference = qty * relation.fuel_reference.average
                actual = relation.summary.fuel_cons_lhr if relation.summary else reference
                support_dew_reference += reference
                support_dew_fuel += actual

    total_actual = loading_actual + support_dew_fuel
    total_reference = loading_reference + support_dew_reference
    productivity = sum(loading_productivity) / sum(loading_qty) if loading_qty else None
    return {
        "contractor_id": contractor.id,
        "code": contractor.code,
        "company_name": contractor.company_name,
        "productivity": productivity,
        "support_dewatering_population": support_dew_population,
        "fuel_deviation_ratio": total_actual / total_reference if total_reference > 0 else 1.0,
        "support_dewatering_fuel_share_pct": (support_dew_fuel / total_actual * 100) if total_actual > 0 else 0.0,
    }


def evaluate_contractor_fuzzy_risk(db: Session, contractor_id: int) -> dict:
    contractor = get_contractor_or_404(db, contractor_id)
    snapshots = [_build_fuzzy_snapshot(item) for item in get_all_contractors(db)]
    productivity_values = [item["productivity"] for item in snapshots if item["productivity"] is not None]
    population_values = [item["support_dewatering_population"] for item in snapshots]
    snapshot = next(item for item in snapshots if item["contractor_id"] == contractor_id)
    inference = infer_mamdani(
        productivity=snapshot["productivity"],
        population=snapshot["support_dewatering_population"],
        fuel_deviation_ratio=snapshot["fuel_deviation_ratio"],
        productivity_values=productivity_values,
        population_values=population_values,
    )
    return {**snapshot, **inference}


def evaluate_all_contractors_fuzzy_risk(db: Session) -> List[dict]:
    contractors = get_all_contractors(db)
    snapshots = [_build_fuzzy_snapshot(item) for item in contractors]
    productivity_values = [item["productivity"] for item in snapshots if item["productivity"] is not None]
    population_values = [item["support_dewatering_population"] for item in snapshots]
    results = []
    for snapshot in snapshots:
        inference = infer_mamdani(
            productivity=snapshot["productivity"],
            population=snapshot["support_dewatering_population"],
            fuel_deviation_ratio=snapshot["fuel_deviation_ratio"],
            productivity_values=productivity_values,
            population_values=population_values,
        )
        results.append({**snapshot, **inference})
    return results


def get_contractor_or_404(db: Session, contractor_id: int) -> Contractor:
    obj = contractor_repo.get_by_id(db, contractor_id)
    if not obj:
        raise HTTPException(
            status_code=404,
            detail=f"Contractor id={contractor_id} tidak ditemukan."
        )
    return obj


def update_contractor(db: Session, contractor_id: int, data: Any) -> Contractor:
    contractor = get_contractor_or_404(db, contractor_id)
    return contractor_repo.update(db, contractor, data)


def delete_contractor(db: Session, contractor_id: int) -> bool:
    contractor = get_contractor_or_404(db, contractor_id)
    if contractor_repo.has_related_data(db, contractor_id):
        raise HTTPException(
            status_code=400,
            detail=f"Tidak dapat menghapus kontraktor '{contractor.company_name}' karena masih memiliki armada equipment terdaftar."
        )
    return contractor_repo.delete(db, contractor)


def evaluate_contractor_performance(db: Session, contractor_id: int) -> dict:
    """
    Service Engine untuk Fitur 1: Contractor Performance Evaluation
    Menyajikan:
      1. Fuel Ratio Keseluruhan (Overall Average)
      2. Fuel Ratio per Aktivitas (Loading, Hauling, Supporting, Dewatering)
      3. Fuel Ratio per Kendaraan / Equipment
    """
    contractor = get_contractor_or_404(db, contractor_id)
    equipments = contractor.equipments

    if not equipments:
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
            "support_dewatering_population": 0,
            "support_dewatering_fuel_cons": 0.0,
            "support_dewatering_fuel_share_pct": 0.0,
            "support_dewatering_fuel_ratio": 0.0,
            "performance_status": "NO_DATA",
            "rule_applied": "No Equipment Data",
            "insight": f"Kontraktor {contractor.company_name} belum memiliki data unit/equipment terdaftar.",
            "activity_breakdowns": [],
            "equipment_breakdowns": [],
        }

    equipment_breakdowns: List[ContractorEquipmentFuelRatio] = []
    activity_map: Dict[str, Dict[str, Any]] = {
        act: {
            "label": cfg["label"],
            "spo_fr": cfg["spo_fr"],
            "total_fuel": 0.0,
            "total_prod": 0.0,
            "equipment_count": 0,
            "units": []
        }
        for act, cfg in ACTIVITY_CONFIGS.items()
    }

    total_target_prod = 0.0
    total_actual_prod = 0.0
    total_actual_fuel = 0.0
    total_target_fuel = 0.0

    for eq in equipments:
        act = (eq.activity or "loading").lower()
        if act not in activity_map:
            act = "loading"

        spo_fr = ACTIVITY_CONFIGS[act]["spo_fr"]
        qty = eq.qty or 1
        prod = eq.productivity or 0.0
        unit_target_prod = qty * prod
        total_target_prod += unit_target_prod

        # Konsumsi fuel: actual summary diprioritaskan, reference menjadi fallback.
        eq_fuel = 60.0 * qty
        loading = _latest_relation(eq.loadings)
        hauling = _latest_relation(eq.haulings)
        supporting = _latest_relation(eq.supportings)
        dewatering = _latest_relation(eq.dewaterings)
        if loading and loading.summary:
            summary = loading.summary
            eq_fuel = summary.fuel_cons_actual if summary.fuel_cons_actual is not None else summary.fuel_cons
            eq_prod = summary.productivity
        elif hauling and hauling.summary:
            eq_fuel = hauling.summary.fuel_cons
            eq_prod = hauling.summary.productivity
        elif supporting and supporting.summary:
            eq_fuel = supporting.summary.fuel_cons_lhr
            eq_prod = 0.0
        elif dewatering and dewatering.summary:
            eq_fuel = dewatering.summary.fuel_cons_lhr
            eq_prod = 0.0
        else:
            eq_prod = prod
            relation = (
                loading or hauling or supporting or dewatering
            )
            if relation and relation.fuel_reference:
                eq_fuel = qty * relation.fuel_reference.average

        # Kalkulasi Fuel Ratio Spesifik Kendaraan
        if act in {"supporting", "dewatering"}:
            pa = 0.90
            ua = 0.53 if act == "supporting" else 0.63
            ewh = pa * ua * HOURS_PER_YEAR
            eq_fr = (ewh * eq_fuel) / TOTAL_ANNUAL_PRODUCTION_BCM
        elif eq_prod > 0:
            eq_fr = eq_fuel / eq_prod
        else:
            eq_fr = 0.0

        fr_var_pct = round(((eq_fr - spo_fr) / spo_fr) * 100, 2) if spo_fr > 0 else 0.0

        eq_dto = ContractorEquipmentFuelRatio(
            equipment_id=eq.id,
            unit_type=eq.unit_type,
            item=eq.item or "General Equipment",
            activity=act,
            qty=qty,
            actual_fuel_cons=round(eq_fuel, 2),
            actual_productivity=round(eq_prod, 2) if eq_prod else None,
            actual_fuel_ratio=round(eq_fr, 4),
            target_fuel_ratio=spo_fr,
            variance_pct=fr_var_pct,
        )
        equipment_breakdowns.append(eq_dto)

        # Akumulasi per Aktivitas & Total Kontraktor
        activity_map[act]["total_fuel"] += eq_fuel
        activity_map[act]["total_prod"] += eq_prod
        activity_map[act]["equipment_count"] += qty

        total_actual_fuel += eq_fuel
        total_actual_prod += eq_prod
        total_target_fuel += (unit_target_prod * spo_fr) if unit_target_prod > 0 else (eq_fuel)

    # Membangun Rincian Fuel Ratio per Aktivitas Operasional
    activity_breakdowns: List[ContractorActivityFuelRatio] = []
    for act, data in activity_map.items():
        if data["equipment_count"] > 0:
            act_spo_fr = data["spo_fr"]
            act_fuel = data["total_fuel"]
            act_prod = data["total_prod"]

            if act in {"supporting", "dewatering"}:
                pa = 0.90
                ua = 0.53 if act == "supporting" else 0.63
                ewh = pa * ua * HOURS_PER_YEAR
                act_actual_fr = (ewh * act_fuel) / TOTAL_ANNUAL_PRODUCTION_BCM
            elif act_prod > 0:
                act_actual_fr = act_fuel / act_prod
            else:
                act_actual_fr = act_spo_fr

            activity_breakdowns.append(
                ContractorActivityFuelRatio(
                    activity=act,
                    label=data["label"],
                    actual_fuel_ratio=round(act_actual_fr, 4),
                    target_fuel_ratio=act_spo_fr,
                    actual_productivity=round(act_prod, 2),
                    actual_fuel_cons=round(act_fuel, 2),
                    equipment_count=data["equipment_count"],
                )
            )

    # Agregasi Keseluruhan (Overall Average)
    if total_actual_prod == 0.0:
        total_actual_prod = total_target_prod if total_target_prod > 0 else 1000.0

    target_overall_fr = round(total_target_fuel / total_target_prod, 4) if total_target_prod > 0 else 0.15
    actual_overall_fr = round(total_actual_fuel / total_actual_prod, 4) if total_actual_prod > 0 else 0.15

    prod_var_pct = round(((total_actual_prod - total_target_prod) / total_target_prod) * 100, 2) if total_target_prod > 0 else 0.0
    overall_fr_var_pct = round(((actual_overall_fr - target_overall_fr) / target_overall_fr) * 100, 2) if target_overall_fr > 0 else 0.0

    support_dewatering_population = sum(
        data["equipment_count"]
        for act, data in activity_map.items()
        if act in {"supporting", "dewatering"}
    )
    support_dewatering_fuel = sum(
        data["total_fuel"]
        for act, data in activity_map.items()
        if act in {"supporting", "dewatering"}
    )
    support_dewatering_fuel_share = round(
        (support_dewatering_fuel / total_actual_fuel) * 100, 2
        if total_actual_fuel > 0 else 0.0
    )
    support_dewatering_fr = round(
        sum(
            next(
                (item.actual_fuel_ratio for item in activity_breakdowns if item.activity == act),
                0.0,
            )
            for act in ("supporting", "dewatering")
        ),
        4,
    )

    # Evaluasi Rule 1
    if total_actual_prod >= total_target_prod and actual_overall_fr <= target_overall_fr:
        status = "HIGH_PERFORMANCE"
        rule = "Rule 1: Productivity UP -> Fuel Ratio DOWN"
        insight = (
            f"Performa {contractor.company_name} SANGAT BAIK. "
            f"Produktivitas naik +{abs(prod_var_pct):.1f}% di atas SPO, berhasil menekan "
            f"Fuel Ratio rata-rata keseluruhan menjadi {actual_overall_fr:.4f} L/BCM (efisiensi meningkat {abs(overall_fr_var_pct):.1f}%)."
        )
    elif total_actual_prod < total_target_prod and actual_overall_fr > target_overall_fr:
        status = "UNDERPERFORMING"
        rule = "Rule 1 Inverted: Productivity DOWN -> Fuel Ratio UP"
        insight = (
            f"Performa {contractor.company_name} KURANG EFEKTIF. "
            f"Produktivitas turun {prod_var_pct:.1f}% di bawah target SPO, menyebabkan "
            f"Fuel Ratio rata-rata membengkak menjadi {actual_overall_fr:.4f} L/BCM (+{overall_fr_var_pct:.1f}% over budget)."
        )
    elif total_actual_prod >= total_target_prod and actual_overall_fr > target_overall_fr:
        status = "PRODUCTIVE_BUT_INEFFICIENT"
        rule = "Productivity UP with High Fuel Consumption"
        insight = (
            f"Kontraktor {contractor.company_name} produktif (+{prod_var_pct:.1f}%), "
            f"namun penggunaan bahan bakar melampaui SPO (+{overall_fr_var_pct:.1f}%). "
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
        "actual_fuel_ratio": actual_overall_fr,
        "target_fuel_ratio": target_overall_fr,
        "productivity_variance_pct": prod_var_pct,
        "fuel_ratio_variance_pct": overall_fr_var_pct,
        "support_dewatering_population": support_dewatering_population,
        "support_dewatering_fuel_cons": round(support_dewatering_fuel, 2),
        "support_dewatering_fuel_share_pct": support_dewatering_fuel_share,
        "support_dewatering_fuel_ratio": support_dewatering_fr,
        "performance_status": status,
        "rule_applied": rule,
        "insight": insight,
        "activity_breakdowns": activity_breakdowns,
        "equipment_breakdowns": equipment_breakdowns,
    }


def evaluate_all_contractors_performance(db: Session) -> List[dict]:
    """Evaluasi performa seluruh kontraktor berbasis Fitur 1 (Rule 1)."""
    contractors = get_all_contractors(db)
    return [evaluate_contractor_performance(db, c.id) for c in contractors]
