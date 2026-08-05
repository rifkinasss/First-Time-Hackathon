from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session

from .config import ACTIVITIES, HOURS_PER_YEAR, TOTAL_ANNUAL_PRODUCTION_BCM
from .data import seed_rows, get_contractors
from app.schemas.monitoring import ActivitySummary, UnitRecord


def variance(actual: float, target: float) -> float:
    return round((actual - target) / target * 100, 2) if target else 0


def make_unit(activity: str, raw: dict[str, Any], index: int) -> UnitRecord:
    config = ACTIVITIES[activity]
    fuel = float(raw["fuelCons"])
    qty = int(raw["qty"])
    productivity = float(raw["productivity"]) if raw.get("productivity") is not None else None
    pa = float(raw["PA"]) if raw.get("PA") is not None else None
    ua = float(raw["UA"]) if raw.get("UA") is not None else None
    ewh = float(raw["EWH"]) if raw.get("EWH") is not None else None

    if activity in {"supporting", "dewatering"}:
        if pa is None or ua is None:
            raise ValueError(f"{activity} units require PA and UA")
        ewh = pa * ua * HOURS_PER_YEAR
        # Excel formula: (Qty x EWH x Fuel Consumption) / Total Production (BCM).
        fuel_ratio = (qty * ewh * fuel) / TOTAL_ANNUAL_PRODUCTION_BCM
    elif productivity is not None and productivity > 0:
        fuel_ratio = fuel / productivity
    else:
        fuel_ratio = 0

    target = config["spo_fr"]
    contractor = raw.get("contractor") or f"PT. Contractor {index + 1}"
    return UnitRecord(
        unitType=raw["unitType"],
        category=raw.get("category"),
        contractor=contractor,
        qty=qty,
        fuelConsumption=fuel,
        productivity=productivity,
        PA=pa,
        UA=ua,
        EWH=round(ewh, 2) if ewh is not None else None,
        fuelRatio=round(fuel_ratio, 4),
        spoTarget=target,
        variancePct=variance(fuel_ratio, target),
    )


def build_units(activity: str, db: Session | None = None) -> list[UnitRecord]:
    return [make_unit(activity, raw, index) for index, raw in enumerate(seed_rows(activity, db=db))]


def filtered_units(
    activity: str, contractor: str | None, unit: str | None, db: Session | None = None
) -> list[UnitRecord]:
    units = build_units(activity, db=db)
    if contractor:
        units = [row for row in units if row.contractor.lower() == contractor.lower()]
    if unit:
        needle = unit.lower()
        units = [
            row
            for row in units
            if needle in row.unitType.lower() or needle in (row.category or "").lower()
        ]
    return units


def calculate_actual_fr(activity: str, units: list[UnitRecord]) -> float:
    """Calculate an activity FR from the supplied unit rows."""
    if not units:
        return 0
    if activity in {"supporting", "dewatering"}:
        # Use source precision instead of summing display-rounded per-unit FR.
        return sum(
            (row.qty * (row.EWH or 0) * row.fuelConsumption) / TOTAL_ANNUAL_PRODUCTION_BCM
            for row in units
        )

    fuel_total = sum(row.qty * row.fuelConsumption for row in units)
    productivity_total = sum(row.qty * (row.productivity or 0) for row in units)
    return fuel_total / productivity_total if productivity_total else 0


def make_summary(activity: str, units: list[UnitRecord]) -> ActivitySummary:
    config = ACTIVITIES[activity]
    fuel_total = sum(row.qty * row.fuelConsumption for row in units)
    productivity_total = sum(row.qty * (row.productivity or 0) for row in units)
    actual_fr = calculate_actual_fr(activity, units)
    return ActivitySummary(
        activity=activity,
        label=config["label"],
        actualFR=round(actual_fr, 4),
        spoFR=config["spo_fr"],
        variancePct=variance(actual_fr, config["spo_fr"]),
        fuelConsumption=round(fuel_total, 2),
        productivity=round(productivity_total, 2),
        equipmentCount=sum(row.qty for row in units),
    )
