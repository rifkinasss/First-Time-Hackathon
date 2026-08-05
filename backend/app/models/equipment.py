from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractor.id"), nullable=False, index=True)
    unit_type = Column(String, nullable=False)
    item = Column(String, nullable=False)
    activity = Column(String, nullable=False)
    qty = Column(Integer, nullable=False)
    productivity = Column(Float, nullable=True)     # None / Null untuk Supporting & Dewatering
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    contractor = relationship("Contractor", back_populates="equipments")
    loadings = relationship("Loading", back_populates="equipment")
    haulings = relationship("Hauling", back_populates="equipment")
    supportings = relationship("Supporting", back_populates="equipment")
    dewaterings = relationship("Dewatering", back_populates="equipment")
