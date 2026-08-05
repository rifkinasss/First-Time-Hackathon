from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Supporting(Base):
    __tablename__ = "supporting"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    fuel_reference_id = Column(Integer, ForeignKey("fuel_reference.id"), nullable=False)
    pa = Column(Float, nullable=False, default=0.90)                    # Physical Availability (90%)
    ua = Column(Float, nullable=False, default=0.53)                    # Use of Availability (53%)
    ewh = Column(Float, nullable=False, default=4121.0)                 # Effective Working Hours
    total_mine_prod_bcm = Column(Float, nullable=False, default=91276500.0) # Total Mine Production BCM
    fuel_consumed_liters = Column(Float, nullable=True)
    operating_hours = Column(Float, nullable=True)
    data_source = Column(String(40), nullable=False, default="OEM_REFERENCE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    equipment = relationship("Equipment", back_populates="supportings")
    fuel_reference = relationship("FuelReference", back_populates="supportings")
    summary = relationship("SupportingSummary", back_populates="supporting", uselist=False)


class SupportingSummary(Base):
    __tablename__ = "supporting_summary"

    id = Column(Integer, primary_key=True, index=True)
    supporting_id = Column(Integer, ForeignKey("supporting.id"), nullable=False, unique=True)
    pa = Column(Float, nullable=False)
    ua = Column(Float, nullable=False)
    ewh = Column(Float, nullable=False)
    fuel_cons_lhr = Column(Float, nullable=False)                       # qty × fuel_reference.average
    total_fuel_liters = Column(Float, nullable=False)                   # qty × PA × UA × EWH × average
    total_mine_prod_bcm = Column(Float, nullable=False)
    fuel_ratio = Column(Float, nullable=False)                          # total_fuel_liters / total_mine_prod_bcm
    fuel_cons_reference = Column(Float, nullable=True)
    fuel_cons_actual = Column(Float, nullable=True)
    fuel_ratio_reference = Column(Float, nullable=True)
    fuel_ratio_actual = Column(Float, nullable=True)
    data_source = Column(String(40), nullable=False, default="OEM_REFERENCE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    supporting = relationship("Supporting", back_populates="summary")
