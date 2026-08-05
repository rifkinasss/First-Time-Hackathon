from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.contractor import Contractor
from app.models.equipment import Equipment
from app.models.loading import Loading
from app.models.supporting import Supporting
from app.models.dewatering import Dewatering
from app.schemas.monitoring import (
    OverviewResponse,
    ActivityResponse,
    TrendPoint,
    ActivitySummary,
    UnitRecord,
)
from app.fuzzy_engine import infer_mamdani

BASELINE_DATE = date(2026, 7, 1)
TOTAL_ANNUAL_PRODUCTION_BCM = 1.05 * 86_930_000
HOURS_PER_YEAR = 24 * 360

ACTIVITIES: Dict[str, Dict[str, Any]] = {
    "loading": {"label": "Loading", "spo_fr": 0.1325, "phase": 0.2},
    "hauling": {"label": "Hauling", "spo_fr": 0.6007, "phase": 1.1},
    "supporting": {"label": "Supporting", "spo_fr": 0.1879, "phase": 2.0},
    "dewatering": {"label": "Dewatering", "spo_fr": 0.3233, "phase": 2.8},
}

FALLBACK_CONTRACTORS = [
    "PT Borneo Mining",
    "PT Kaltim Prima",
    "PT Nusantara Hauling",
    "PT Sumber Energi"
]


def variance(actual: float, target: float) -> float:
    return round((actual - target) / target * 100, 2) if target else 0.0


def make_trend(db: Session, activity: str, days: int = 21) -> List[TrendPoint]:
    """Aggregate actual transaction summaries by their recorded date.

    No synthetic points are generated. A single point is returned when the
    database currently contains only one transaction date.
    """
    config = ACTIVITIES.get(activity, {"label": activity.capitalize(), "spo_fr": 0.15})
    buckets: Dict[str, Dict[str, float]] = {}

    if activity == "loading":
        rows = db.query(Loading).join(Loading.summary).join(Equipment).all()
        for transaction in rows:
            summary = transaction.summary
            stamp = summary.created_at or transaction.created_at
            if not stamp:
                continue
            key = stamp.date().isoformat()
            bucket = buckets.setdefault(key, {"fuel": 0.0, "production": 0.0})
            bucket["fuel"] += summary.fuel_cons_actual or summary.fuel_cons
            bucket["production"] += summary.productivity
    elif activity == "supporting":
        rows = db.query(Supporting).join(Supporting.summary).join(Equipment).all()
        for transaction in rows:
            summary = transaction.summary
            stamp = summary.created_at or transaction.created_at
            if not stamp:
                continue
            key = stamp.date().isoformat()
            bucket = buckets.setdefault(key, {"fuel": 0.0, "production": 0.0})
            bucket["fuel"] += summary.total_fuel_liters
            bucket["production"] += summary.total_mine_prod_bcm
    elif activity == "dewatering":
        rows = db.query(Dewatering).join(Dewatering.summary).join(Equipment).all()
        for transaction in rows:
            summary = transaction.summary
            stamp = summary.created_at or transaction.created_at
            if not stamp:
                continue
            key = stamp.date().isoformat()
            bucket = buckets.setdefault(key, {"fuel": 0.0, "production": 0.0})
            bucket["fuel"] += summary.total_fuel_liters
            bucket["production"] += summary.total_mine_prod_bcm

    selected_dates = sorted(buckets)[-days:]
    return [
        TrendPoint(
            date=key,
            actualFR=round(bucket["fuel"] / bucket["production"], 4) if bucket["production"] > 0 else 0.0,
            spoFR=config["spo_fr"],
            fuelConsumption=round(bucket["fuel"], 2),
            production=round(bucket["production"], 2),
        )
        for key in selected_dates
        for bucket in [buckets[key]]
    ]


def get_contractors_list(db: Session) -> List[str]:
    contractors = db.query(Contractor).all()
    if contractors:
        return [c.company_name for c in contractors]
    return FALLBACK_CONTRACTORS


def get_units_for_activity(db: Session, activity: str) -> List[UnitRecord]:
    equipments = db.query(Equipment).filter(func.upper(Equipment.activity) == activity.upper()).all()
    config = ACTIVITIES.get(activity, {"spo_fr": 0.15})
    target_fr = config["spo_fr"]
    population_by_contractor: Dict[int, int] = {}
    productivity_values = [eq.productivity for eq in equipments if eq.productivity and eq.productivity > 0]
    population_values = []
    for equipment in equipments:
        population_by_contractor[equipment.contractor_id] = population_by_contractor.get(equipment.contractor_id, 0) + (equipment.qty or 0)
    population_values = list(population_by_contractor.values())

    unit_records: List[UnitRecord] = []
    fuzzy_inputs = []
    for idx, eq in enumerate(equipments):
        contractor_name = eq.contractor.company_name if eq.contractor else FALLBACK_CONTRACTORS[idx % len(FALLBACK_CONTRACTORS)]
        
        # Konsumsi fuel aktual diprioritaskan; reference OEM menjadi fallback.
        fuel_cons = 60.0
        fuel_reference_average = 60.0
        if eq.loadings and eq.loadings[0].fuel_reference:
            fuel_reference_average = eq.loadings[0].fuel_reference.average
            fuel_cons = fuel_reference_average
            summary = eq.loadings[0].summary
            if summary and summary.fuel_cons_actual and summary.fuel_cons_actual > 0:
                fuel_cons = summary.fuel_cons_actual / max(eq.qty or 1, 1)
        elif eq.haulings and eq.haulings[0].fuel_reference:
            fuel_reference_average = eq.haulings[0].fuel_reference.average
            fuel_cons = fuel_reference_average
        elif eq.supportings and eq.supportings[0].fuel_reference:
            fuel_reference_average = eq.supportings[0].fuel_reference.average
            fuel_cons = fuel_reference_average
        elif eq.dewaterings and eq.dewaterings[0].fuel_reference:
            fuel_reference_average = eq.dewaterings[0].fuel_reference.average
            fuel_cons = fuel_reference_average

        qty = eq.qty or 1
        prod = eq.productivity

        if activity in {"supporting", "dewatering"}:
            pa = 0.90
            ua = 0.53 if activity == "supporting" else 0.63
            ewh = pa * ua * HOURS_PER_YEAR
            fuel_ratio = (qty * ewh * fuel_cons) / TOTAL_ANNUAL_PRODUCTION_BCM
        elif prod and prod > 0:
            pa, ua, ewh = None, None, None
            fuel_ratio = fuel_cons / prod
        else:
            pa, ua, ewh = None, None, None
            fuel_ratio = 0.0

        unit_records.append(
            UnitRecord(
                unitType=eq.unit_type,
                category=eq.item,
                contractor=contractor_name,
                qty=qty,
                fuelConsumption=fuel_cons,
                productivity=prod,
                PA=pa,
                UA=ua,
                EWH=round(ewh, 2) if ewh is not None else None,
                fuelRatio=round(fuel_ratio, 4),
                spoTarget=target_fr,
                variancePct=variance(fuel_ratio, target_fr),
            )
        )
        fuzzy_inputs.append(
            (
                eq.contractor_id,
                prod,
                population_by_contractor.get(eq.contractor_id, eq.qty or 0),
                fuel_cons / fuel_reference_average if fuel_reference_average > 0 else None,
            )
        )

    enriched_records: List[UnitRecord] = []
    for record, (contractor_id, productivity, population, fuel_deviation_ratio) in zip(unit_records, fuzzy_inputs):
        fuzzy = infer_mamdani(
            productivity=productivity,
            population=population,
            fuel_deviation_ratio=fuel_deviation_ratio,
            productivity_values=productivity_values,
            population_values=population_values,
        )
        enriched_records.append(
            record.model_copy(
                update={
                    "fuzzyRiskScore": fuzzy["risk_score"],
                    "fuzzyRiskLevel": fuzzy["risk_level"],
                    "fuzzyDominantRules": fuzzy["dominant_rules"],
                    "fuzzyMembership": fuzzy["membership"],
                }
            )
        )

    return enriched_records


def calculate_actual_fr(activity: str, units: List[UnitRecord]) -> float:
    if not units:
        return ACTIVITIES.get(activity, {}).get("spo_fr", 0.15)
    if activity in {"supporting", "dewatering"}:
        return sum(
            (row.qty * (row.EWH or 0) * row.fuelConsumption) / TOTAL_ANNUAL_PRODUCTION_BCM
            for row in units
        )

    fuel_total = sum(row.qty * row.fuelConsumption for row in units)
    prod_total = sum(row.qty * (row.productivity or 0) for row in units)
    return fuel_total / prod_total if prod_total > 0 else 0.0


def make_summary(activity: str, units: List[UnitRecord]) -> ActivitySummary:
    config = ACTIVITIES.get(activity, {"label": activity.capitalize(), "spo_fr": 0.15})
    fuel_total = sum(row.qty * row.fuelConsumption for row in units)
    prod_total = sum(row.qty * (row.productivity or 0) for row in units)
    actual_fr = calculate_actual_fr(activity, units)

    return ActivitySummary(
        activity=activity,
        label=config["label"],
        actualFR=round(actual_fr, 4),
        spoFR=config["spo_fr"],
        variancePct=variance(actual_fr, config["spo_fr"]),
        fuelConsumption=round(fuel_total, 2),
        productivity=round(prod_total, 2),
        equipmentCount=sum(row.qty for row in units),
    )


def get_overview_data(db: Session) -> OverviewResponse:
    activity_units = {act: get_units_for_activity(db, act) for act in ACTIVITIES}
    summaries = [make_summary(act, activity_units[act]) for act in ACTIVITIES]
    
    activity_trends = {act: make_trend(db, act) for act in ACTIVITIES}
    
    combined_trend: List[TrendPoint] = []
    all_dates = sorted({point.date for points in activity_trends.values() for point in points})
    for trend_date in all_dates:
        points = [point for points in activity_trends.values() for point in points if point.date == trend_date]
        if not points:
            continue
        combined_trend.append(
            TrendPoint(
                date=trend_date,
                actualFR=round(sum(p.actualFR for p in points), 4),
                spoFR=round(sum(p.spoFR for p in points), 4),
                fuelConsumption=round(sum(p.fuelConsumption for p in points), 0),
                production=round(sum(p.production for p in points), 0),
            )
        )

    contractors = get_contractors_list(db)

    return OverviewResponse(
        totalFuelConsumption=round(sum(s.fuelConsumption for s in summaries), 2),
        totalProduction=round(sum(s.productivity for s in summaries), 2),
        averageFuelRatio=round(
            sum(calculate_actual_fr(act, activity_units[act]) for act in ACTIVITIES),
            4,
        ),
        totalContractors=len(contractors),
        totalEquipment=sum(s.equipmentCount for s in summaries),
        averageProductivity=round(sum(s.productivity for s in summaries[:2]) / 2, 2) if len(summaries) >= 2 else 0.0,
        trend=combined_trend,
        activities=summaries,
    )


def get_activity_detail(
    db: Session,
    activity: str,
    contractor: Optional[str] = None,
    unit: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
) -> ActivityResponse:
    units = get_units_for_activity(db, activity)
    if contractor:
        units = [u for u in units if contractor.lower() in u.contractor.lower()]
    if unit:
        needle = unit.lower()
        units = [u for u in units if needle in u.unitType.lower() or needle in (u.category or "").lower()]

    summary = make_summary(activity, units)
    trend = make_trend(db, activity)

    if from_date:
        trend = [t for t in trend if date.fromisoformat(t.date) >= from_date]
    if to_date:
        trend = [t for t in trend if date.fromisoformat(t.date) <= to_date]

    contractors = get_contractors_list(db)
    config = ACTIVITIES.get(activity, {"label": activity.capitalize()})

    return ActivityResponse(
        activity=activity,
        label=config["label"],
        units=units,
        trend=trend,
        summary=summary,
        contractors=contractors,
    )
