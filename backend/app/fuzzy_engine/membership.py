"""Membership functions and threshold helpers for the Mamdani model."""

from __future__ import annotations

from typing import Dict, Optional, Sequence, Tuple
from app.fuzzy_engine.config import FUEL_MEMBERSHIP

LABELS = ("DOWN", "NORMAL", "UP")


def trimf(x: float, a: float, b: float, c: float) -> float:
    if a == b and x <= b:
        return 1.0 if x <= c else 0.0
    if b == c and x >= b:
        return 1.0 if x >= a else 0.0
    if x <= a or x >= c:
        return 0.0
    if x == b:
        return 1.0
    return (x - a) / (b - a) if x < b else (c - x) / (c - b)


def left_shoulder(x: float, a: float, b: float) -> float:
    if x <= a:
        return 1.0
    if x >= b:
        return 0.0
    return (b - x) / (b - a)


def right_shoulder(x: float, a: float, b: float) -> float:
    if x <= a:
        return 0.0
    if x >= b:
        return 1.0
    return (x - a) / (b - a)


def quartiles(values: Sequence[float]) -> Tuple[float, float, float]:
    ordered = sorted(float(value) for value in values)
    if not ordered:
        return 0.0, 0.0, 0.0

    def percentile(percent: float) -> float:
        position = (len(ordered) - 1) * percent
        lower = int(position)
        upper = min(lower + 1, len(ordered) - 1)
        return ordered[lower] + (ordered[upper] - ordered[lower]) * (position - lower)

    return percentile(0.25), percentile(0.50), percentile(0.75)


def three_sets(value: Optional[float], q25: float, q50: float, q75: float) -> Dict[str, float]:
    if value is None:
        return {label: 0.0 for label in LABELS}
    if q25 == q50 == q75:
        return {"DOWN": 0.0, "NORMAL": 1.0, "UP": 0.0}
    if q25 == q50:
        q25 = q50 - max(abs(q75 - q50) * 0.25, 1e-9)
    if q50 == q75:
        q75 = q50 + max(abs(q50 - q25) * 0.25, 1e-9)
    return {
        "DOWN": left_shoulder(value, q25, q50),
        "NORMAL": trimf(value, q25, q50, q75),
        "UP": right_shoulder(value, q50, q75),
    }


def fuel_sets(deviation_ratio: Optional[float]) -> Dict[str, float]:
    if deviation_ratio is None:
        return {label: 0.0 for label in LABELS}
    return {
        "DOWN": left_shoulder(deviation_ratio, *FUEL_MEMBERSHIP["DOWN"]),
        "NORMAL": trimf(deviation_ratio, *FUEL_MEMBERSHIP["NORMAL"]),
        "UP": right_shoulder(deviation_ratio, *FUEL_MEMBERSHIP["UP"]),
    }
