# Import semua model agar SQLAlchemy mengenali seluruh tabel
# saat create_all() dipanggil di main.py
from app.models.contractor import Contractor
from app.models.user import User
from app.models.equipment import Equipment
from app.models.fuel_reference import FuelReference
from app.models.loading import Loading, LoadingSummary
from app.models.hauling_distance_ref import HaulingDistanceRef
from app.models.hauling import Hauling, HaulingSummary
from app.models.supporting import Supporting, SupportingSummary
from app.models.dewatering import Dewatering, DewateringSummary

__all__ = [
    "Contractor",
    "User",
    "Equipment",
    "FuelReference",
    "Loading",
    "LoadingSummary",
    "HaulingDistanceRef",
    "Hauling",
    "HaulingSummary",
    "Supporting",
    "SupportingSummary",
    "Dewatering",
    "DewateringSummary",
]
