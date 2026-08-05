from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.hauling_distance_ref import HaulingDistanceRef


def get_all(db: Session) -> List[HaulingDistanceRef]:
    return db.query(HaulingDistanceRef).order_by(HaulingDistanceRef.km).all()


def get_by_km(db: Session, km: float) -> Optional[HaulingDistanceRef]:
    """Cari acuan produktivitas berdasarkan km (pembulatan 2 desimal)."""
    target_km = round(km, 2)
    # Cari persis
    exact = db.query(HaulingDistanceRef).filter(HaulingDistanceRef.km == target_km).first()
    if exact:
        return exact

    # Jika tidak ada persis, cari terdekat
    all_refs = get_all(db)
    if not all_refs:
        return None

    closest = min(all_refs, key=lambda x: abs(x.km - target_km))
    return closest
