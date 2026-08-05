"""Mamdani inference and centroid defuzzification."""

from __future__ import annotations

from typing import Dict, Optional, Sequence

from app.fuzzy_engine.membership import fuel_sets, quartiles, right_shoulder, left_shoulder, three_sets, trimf
from app.fuzzy_engine.config import FUZZY_CONFIG_VERSION, OUTPUT_MEMBERSHIP
from app.fuzzy_engine.rulebase import build_rules


def infer_mamdani(
    productivity: Optional[float],
    population: float,
    fuel_deviation_ratio: Optional[float],
    productivity_values: Sequence[float],
    population_values: Sequence[float],
) -> Dict[str, object]:
    productivity_mu = (
        three_sets(productivity, *quartiles(productivity_values))
        if productivity is not None else {"DOWN": 0.0, "NORMAL": 1.0, "UP": 0.0}
    )
    population_mu = three_sets(population, *quartiles(population_values))
    fuel_mu = fuel_sets(fuel_deviation_ratio)

    output = {"DOWN": 0.0, "NORMAL": 0.0, "UP": 0.0}
    fired_rules: Dict[str, float] = {}
    for name, strength, consequent in build_rules(productivity_mu, population_mu, fuel_mu):
        output[consequent] = max(output[consequent], strength)
        if strength > 0:
            fired_rules[name] = round(strength, 4)

    numerator = denominator = 0.0
    for index in range(1001):
        score = index / 1000.0
        aggregated = max(
            min(output["DOWN"], left_shoulder(score, *OUTPUT_MEMBERSHIP["DOWN"])),
            min(output["NORMAL"], trimf(score, *OUTPUT_MEMBERSHIP["NORMAL"])),
            min(output["UP"], right_shoulder(score, *OUTPUT_MEMBERSHIP["UP"])),
        )
        numerator += score * aggregated
        denominator += aggregated

    risk_score = numerator / denominator if denominator else 0.5
    risk_level = "LOW" if risk_score <= 0.35 else "NORMAL" if risk_score <= 0.65 else "HIGH"
    dominant_rules = ", ".join(
        name for name, _ in sorted(fired_rules.items(), key=lambda item: item[1], reverse=True)[:3]
    ) or "NO_RULE_FIRED"
    return {
        "risk_score": round(risk_score, 4),
        "risk_level": risk_level,
        "dominant_rules": dominant_rules,
        "config_version": FUZZY_CONFIG_VERSION,
        "membership": {
            "productivity": {key: round(value, 4) for key, value in productivity_mu.items()},
            "population": {key: round(value, 4) for key, value in population_mu.items()},
            "fuel": {key: round(value, 4) for key, value in fuel_mu.items()},
        },
    }
