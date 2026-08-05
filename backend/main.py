"""Uvicorn entrypoint for the FRMS API.

Supports both ``uvicorn backend.main:app`` from the repository root and
``uvicorn main:app`` from inside the backend directory.
"""

try:
    from .app.api import app
except ImportError:  # pragma: no cover - compatibility for direct uvicorn usage
    from app.api import app


__all__ = ["app"]
