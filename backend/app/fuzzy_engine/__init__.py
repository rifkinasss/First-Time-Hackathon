"""Central fuzzy-logic package used by the monitoring application."""

from app.fuzzy_engine.mamdani import infer_mamdani

__all__ = ["infer_mamdani"]
