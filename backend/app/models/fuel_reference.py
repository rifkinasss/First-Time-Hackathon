from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class FuelReference(Base):
    __tablename__ = "fuel_reference"

    id = Column(Integer, primary_key=True, index=True)
    merk = Column(String, nullable=False)
    type = Column(String, nullable=False)
    activity = Column(String, nullable=False)
    average = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    mid = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    loadings = relationship("Loading", back_populates="fuel_reference")
    haulings = relationship("Hauling", back_populates="fuel_reference")
    supportings = relationship("Supporting", back_populates="fuel_reference")
    dewaterings = relationship("Dewatering", back_populates="fuel_reference")
