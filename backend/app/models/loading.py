from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Loading(Base):
    __tablename__ = "loading"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    fuel_reference_id = Column(Integer, ForeignKey("fuel_reference.id"), nullable=False)
    fuel_consumed_liters = Column(Float, nullable=True)  # Total liter aktual selama periode
    operating_hours = Column(Float, nullable=True)      # Jam operasi selama periode
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    equipment = relationship("Equipment", back_populates="loadings")
    fuel_reference = relationship("FuelReference", back_populates="loadings")
    summary = relationship("LoadingSummary", back_populates="loading", uselist=False)


class LoadingSummary(Base):
    __tablename__ = "loading_summary"

    id = Column(Integer, primary_key=True, index=True)
    loading_id = Column(Integer, ForeignKey("loading.id"), nullable=False, unique=True)
    fuel_cons = Column(Float, nullable=False)       # qty × fuel_reference.average
    productivity = Column(Float, nullable=False)    # qty × equipment.productivity
    fuel_ratio = Column(Float, nullable=False)      # fuel_cons / productivity
    fuel_cons_reference = Column(Float, nullable=False, default=0.0)  # Fleet L/HR dari OEM
    fuel_cons_actual = Column(Float, nullable=True)                   # Fleet L/HR aktual
    fuel_ratio_reference = Column(Float, nullable=False, default=0.0)
    fuel_ratio_actual = Column(Float, nullable=True)
    data_source = Column(String(40), nullable=False, default="OEM_REFERENCE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loading = relationship("Loading", back_populates="summary")
