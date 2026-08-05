from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Any, Literal


ActivityName = Literal["loading", "hauling", "supporting", "dewatering"]
BASELINE_DATE = date(2026, 7, 1)

# Workbook O26/X26: 1.05 x 86,930,000 BCM.
TOTAL_ANNUAL_PRODUCTION_BCM = 1.05 * 86_930_000
HOURS_PER_YEAR = 24 * 360

ACTIVITIES: dict[str, dict[str, Any]] = {
    "loading": {"label": "Loading", "spo_fr": 0.1325, "phase": 0.2},
    "hauling": {"label": "Hauling", "spo_fr": 0.6007, "phase": 1.1},
    "supporting": {"label": "Supporting", "spo_fr": 0.1879, "phase": 2.0},
    "dewatering": {"label": "Dewatering", "spo_fr": 0.3233, "phase": 2.8},
}

