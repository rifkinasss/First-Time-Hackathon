from __future__ import annotations

import math
from datetime import timedelta

from .calculations import build_units, calculate_actual_fr
from .config import ACTIVITIES, BASELINE_DATE
from .models import TrendPoint


def make_trend(activity: str, days: int = 21) -> list[TrendPoint]:
    config = ACTIVITIES[activity]
    actual_base = calculate_actual_fr(activity, build_units(activity))
    points: list[TrendPoint] = []
    for index in range(days):
        wave = 1 + 0.045 * math.sin(index * 0.85 + config["phase"]) + 0.025 * math.cos(index * 0.31)
        points.append(
            TrendPoint(
                date=(BASELINE_DATE + timedelta(days=index)).isoformat(),
                actualFR=round(actual_base * wave, 4),
                spoFR=round(config["spo_fr"] * (1 + 0.008 * math.sin(index * 0.4)), 4),
                fuelConsumption=round((10000 + index * 135) * wave, 0),
                production=round((10000 + index * 110) / wave, 0),
            )
        )
    return points
