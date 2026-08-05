from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class FuelReferenceCreate(BaseModel):
    merk: str = Field(..., description="Merk kendaraan/alat berat")
    type: str = Field(..., description="Tipe/model kendaraan")
    activity: str = Field(..., description="Aktivitas (misal: Loading)")
    average: float = Field(..., gt=0, description="Konsumsi BBM rata-rata (L/jam)")
    low: float = Field(..., gt=0, description="Konsumsi BBM rendah")
    mid: float = Field(..., gt=0, description="Konsumsi BBM menengah")
    high: float = Field(..., gt=0, description="Konsumsi BBM tinggi")


class FuelReferenceUpdate(BaseModel):
    merk: Optional[str] = None
    type: Optional[str] = None
    activity: Optional[str] = None
    average: Optional[float] = Field(None, gt=0)
    low: Optional[float] = Field(None, gt=0)
    mid: Optional[float] = Field(None, gt=0)
    high: Optional[float] = Field(None, gt=0)


class FuelReferenceResponse(BaseModel):
    id: int
    merk: str
    type: str
    activity: str
    average: float
    low: float
    mid: float
    high: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
