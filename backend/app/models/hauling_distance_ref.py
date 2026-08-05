from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base


class HaulingDistanceRef(Base):
    __tablename__ = "hauling_distance_ref"

    id = Column(Integer, primary_key=True, index=True)
    km = Column(Float, nullable=False, unique=True, index=True)
    load_time = Column(Float, nullable=False)
    haul_time = Column(Float, nullable=False)
    dump_time = Column(Float, nullable=False)
    return_time = Column(Float, nullable=False)
    cycle_time = Column(Float, nullable=False)
    bcm_per_hr = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
