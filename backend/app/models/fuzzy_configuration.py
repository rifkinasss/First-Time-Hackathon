from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func
from app.database import Base


class FuzzyConfiguration(Base):
    __tablename__ = "fuzzy_configuration"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False, default="contractor_fuel_ratio_mamdani")
    version = Column(String(30), nullable=False, unique=True)
    config_json = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
