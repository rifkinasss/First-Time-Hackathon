from __future__ import annotations

import csv
import os
from pathlib import Path
from typing import Any
from sqlalchemy.orm import Session

from .config import HOURS_PER_YEAR

# Fuel consumption fallback map (L/hr) derived from Kinas's Ref Fuel & Activity CSVs
DEFAULT_FUEL_CONS: dict[str, float] = {
    # Loading
    "EX26007": 187.0, "EX2600-6": 187.0,
    "PC125011R": 59.0, "PC1250-11R": 59.0,
    "PC1250SP8": 64.0,
    "PC200011R": 100.0, "PC2000-11R": 100.0,
    "PC20008": 100.0, "PC2000-8": 100.0,
    "PC3400": 12.0,
    "PC3400EX11": 21.0,
    # Hauling
    "HD7857": 77.0,
    "HD7858": 77.0,
    # Supporting
    "CAT14M3": 16.0,
    "D155-6": 29.0, "D155A6A": 29.0, "D155A6R": 29.0, "D155A-6R": 29.0,
    "D375-6": 67.0, "D375A6R": 67.0,
    "D85ESS2": 27.0, "D85ESS-2": 27.0,
    "GD825A2": 29.0,
    "FMX440FT": 44.0, "FMX440WT": 23.0, "FM9": 30.0,
    "HD7857WT": 77.0, "HD7857OTD": 77.0,
    "P360CB6X6": 26.0, "P360CB6X6WT": 26.0, "P360CB8X4": 30.0, "P380CB6X6": 30.0,
    "PC200SC": 25.0, "PC300": 35.0, "PC400": 45.0, "PC400DF": 45.0,
    "PC800SC": 65.0, "PC8508R1": 70.0, "PC850SP8": 70.0,
    # Dewatering
    "DNDLSA6X8": 40.0,
    "DREDGER 12/10": 75.0, "DREDGER 12/1": 75.0, "DREDGERPUMP": 75.0,
    "DRHY85160B": 45.0,
    "EGS380-6": 10.0,
    "EWP420": 40.0,
    "KSB": 25.0,
    "MEB420EXHV": 40.0,
    "MF420E": 40.0, "MF-420E": 40.0, "MF420EX": 40.0, "MF420EXHV": 40.0,
    "MFV290": 13.0, "MFV290C": 13.0, "MFV420EXHV": 40.0,
    "RF85MW": 50.0, "RF-85MW": 50.0,
}


def get_contractors(db: Session | None = None) -> list[str]:
    """Return list of contractor company names from DB or fallback CSV."""
    if db is not None:
        from app.models.contractor import Contractor
        contractors = db.query(Contractor).filter(Contractor.status == "active").all()
        if contractors:
            return [c.company_name for c in contractors]

    # CSV / static fallback
    data_dir = Path(__file__).resolve().parents[1] / "data"
    csv_file = data_dir / "Contractor - Sheet1.csv"
    if csv_file.exists():
        with csv_file.open(encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            return [row["company_name"].strip() for row in reader if row.get("company_name")]

    return [f"PT. {chr(65+i)}" for i in range(10)]


def get_fuel_cons(unit_type: str, db: Session | None = None) -> float:
    """Look up fuel consumption for unit_type from FuelReference DB or fallback map."""
    if db is not None:
        from app.models.fuel_reference import FuelReference
        fr = db.query(FuelReference).filter(FuelReference.type.like(f"%{unit_type}%")).first()
        if not fr:
            fr = db.query(FuelReference).filter(FuelReference.merk.like(f"%{unit_type}%")).first()
        if fr and fr.average > 0:
            return float(fr.average)

    # Clean unit_type key for fallback dictionary
    clean_key = unit_type.strip()
    if clean_key in DEFAULT_FUEL_CONS:
        return DEFAULT_FUEL_CONS[clean_key]

    for key, val in DEFAULT_FUEL_CONS.items():
        if key in clean_key or clean_key in key:
            return val

    return 30.0  # Safe default fuel consumption L/hr


def seed_rows(activity: str, db: Session | None = None) -> list[dict[str, Any]]:
    """Return normalized unit records for specified activity, querying DB or CSV files."""
    act_lower = activity.lower()
    rows: list[dict[str, Any]] = []

    if db is not None:
        from app.models.equipment import Equipment
        equipments = db.query(Equipment).filter(Equipment.activity.ilike(act_lower)).all()
        for eq in equipments:
            contractor_name = eq.contractor.company_name if eq.contractor else f"PT. Contractor {eq.contractor_id}"
            fuel_cons = get_fuel_cons(eq.unit_type, db)

            pa = 0.90 if act_lower in {"supporting", "dewatering"} else None
            ua = 0.53 if act_lower == "supporting" else (0.63 if act_lower == "dewatering" else None)
            ewh = pa * ua * HOURS_PER_YEAR if pa and ua else None

            prod = eq.productivity if eq.productivity and eq.productivity > 0 else None
            if act_lower == "hauling" and (prod is None or prod <= 0):
                prod = 109.5652

            rows.append({
                "unitType": eq.unit_type,
                "category": eq.item,
                "contractor": contractor_name,
                "qty": eq.qty,
                "fuelCons": fuel_cons,
                "productivity": prod,
                "PA": pa,
                "UA": ua,
                "EWH": ewh,
            })
        if rows:
            return rows

    # CSV Fallback if DB is empty or None
    data_dir = Path(__file__).resolve().parents[1] / "data"
    eq_csv = data_dir / "Equipment - Sheet1.csv"
    contractors = get_contractors(db=None)

    if eq_csv.exists():
        with eq_csv.open(encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                row_act = row.get("Activity", "").strip().lower()
                if row_act != act_lower:
                    continue

                unit_type = row.get("Unit type list", "").strip()
                item = row.get("Item", "").strip()
                qty = int(row.get("Qty (unit)", "1").strip() or 1)

                p_str = row.get("Productivity (bcm/hr)", "0").strip().replace(",", ".")
                prod = float(p_str) if p_str and not p_str.startswith("#") else None
                if act_lower == "hauling" and (prod is None or prod <= 0):
                    prod = 109.5652

                contractor_code = row.get("contractor_code", "").strip()
                contractor = contractor_code if contractor_code else contractors[idx % len(contractors)]

                fuel_cons = get_fuel_cons(unit_type, db=None)
                pa = 0.90 if act_lower in {"supporting", "dewatering"} else None
                ua = 0.53 if act_lower == "supporting" else (0.63 if act_lower == "dewatering" else None)
                ewh = pa * ua * HOURS_PER_YEAR if pa and ua else None

                rows.append({
                    "unitType": unit_type,
                    "category": item,
                    "contractor": contractor,
                    "qty": qty,
                    "fuelCons": fuel_cons,
                    "productivity": prod,
                    "PA": pa,
                    "UA": ua,
                    "EWH": ewh,
                })

    return rows
