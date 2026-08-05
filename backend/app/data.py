from __future__ import annotations

import json
from typing import Any

from .config import ACTIVITIES, CONTRACTORS, DATA_PATH, HOURS_PER_YEAR


def load_seed() -> dict[str, list[dict[str, Any]]]:
    with DATA_PATH.open(encoding="utf-8") as seed_file:
        return json.load(seed_file)["activities"]


SEED = load_seed()


def contractor_for(index: int) -> str:
    return CONTRACTORS[index % len(CONTRACTORS)]


def seed_rows(activity: str) -> list[dict[str, Any]]:
    """Return normalized raw rows, including defaults for support equipment."""
    rows: list[dict[str, Any]] = []
    for index, raw in enumerate(SEED[activity]):
        row = dict(raw)
        row.setdefault("contractor", contractor_for(index))
        if activity in {"supporting", "dewatering"}:
            row.setdefault("PA", 0.90)
            row.setdefault("UA", 0.53 if activity == "supporting" else 0.63)
            row["EWH"] = float(row["PA"]) * float(row["UA"]) * HOURS_PER_YEAR
        rows.append(row)
    return rows
