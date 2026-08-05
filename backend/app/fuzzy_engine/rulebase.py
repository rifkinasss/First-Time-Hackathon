"""Business rule base for fuel-ratio risk monitoring."""

from __future__ import annotations

from typing import Dict, List, Tuple


Rule = Tuple[str, float, str]


def build_rules(productivity: Dict[str, float], population: Dict[str, float], fuel: Dict[str, float]) -> List[Rule]:
    """Build Mamdani rules; antecedents are evaluated with MIN by the engine."""
    return [
        ("R1_productivity_up", productivity["UP"], "DOWN"),
        ("R2_population_up", population["UP"], "UP"),
        ("R3_fuel_up", fuel["UP"], "UP"),
        ("R4_low_productivity_high_population", min(productivity["DOWN"], population["UP"]), "UP"),
        ("R5_low_productivity_high_fuel", min(productivity["DOWN"], fuel["UP"]), "UP"),
        ("R6_normal_operation", min(productivity["NORMAL"], population["NORMAL"], fuel["NORMAL"]), "NORMAL"),
        ("R7_optimal_operation", min(productivity["UP"], population["DOWN"], fuel["DOWN"]), "DOWN"),
    ]
