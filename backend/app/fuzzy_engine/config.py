"""Versioned business configuration for the Mamdani engine."""

FUZZY_CONFIG_VERSION = "2026.08.1"

FUEL_MEMBERSHIP = {
    "DOWN": (0.90, 1.00),
    "NORMAL": (0.90, 1.00, 1.10),
    "UP": (1.00, 1.10),
}

OUTPUT_MEMBERSHIP = {
    "DOWN": (0.00, 0.50),
    "NORMAL": (0.25, 0.50, 0.75),
    "UP": (0.50, 1.00),
}

DEFAULT_CONFIG = {
    "version": FUZZY_CONFIG_VERSION,
    "fuel_membership": FUEL_MEMBERSHIP,
    "output_membership": OUTPUT_MEMBERSHIP,
    "risk_thresholds": {"LOW_MAX": 0.35, "NORMAL_MAX": 0.65},
    "inference": {"and": "MIN", "aggregation": "MAX", "defuzzification": "CENTROID"},
}
