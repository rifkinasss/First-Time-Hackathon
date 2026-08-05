from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Hauling(Base):
    __tablename__ = "hauling"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    fuel_reference_id = Column(Integer, ForeignKey("fuel_reference.id"), nullable=False)
    distance_km = Column(Float, nullable=False, default=3.90)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    equipment = relationship("Equipment", back_populates="haulings")
    fuel_reference = relationship("FuelReference", back_populates="haulings")
    summary = relationship("HaulingSummary", back_populates="hauling", uselist=False)


class HaulingSummary(Base):
    __tablename__ = "hauling_summary"

    id = Column(Integer, primary_key=True, index=True)
    hauling_id = Column(Integer, ForeignKey("hauling.id"), nullable=False, unique=True)
    distance_km = Column(Float, nullable=False)
    fuel_cons = Column(Float, nullable=False)       # equipment.qty × fuel_reference.average
    productivity = Column(Float, nullable=False)    # equipment.qty × bcm_per_hr (from distance ref)
    fuel_ratio = Column(Float, nullable=False)      # fuel_cons / productivity
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hauling = relationship("Hauling", back_populates="summary")
