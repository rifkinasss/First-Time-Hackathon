from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(Integer, ForeignKey("contractor.id"), nullable=True)
    username = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="viewer")
    # Role: super_admin | contractor_admin | viewer
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contractor = relationship("Contractor", back_populates="users")
