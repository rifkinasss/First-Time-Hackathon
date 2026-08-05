from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.schemas.equipment import EquipmentResponse
from app.schemas.fuel_reference import FuelReferenceResponse


class HaulingCreate(BaseModel):
    equipment_id: int = Field(..., description="ID equipment yang digunakan (misal Dump Truck)")
    fuel_reference_id: int = Field(..., description="ID fuel reference yang digunakan")
    distance_km: float = Field(default=3.90, gt=0, description="Jarak angkut dalam km (misal: 3.90)")


class HaulingCalculateRequest(BaseModel):
    equipment_id: int = Field(..., gt=0, description="ID equipment yang dipilih untuk transaksi")
    fuel_reference_id: int = Field(..., gt=0, description="ID fuel reference yang dipilih")
    distance_km: float = Field(default=3.90, gt=0, description="Jarak angkut dalam km (misal: 3.90)")


class HaulingSummaryResponse(BaseModel):
    id: int
    hauling_id: int
    distance_km: float
    fuel_cons: float
    productivity: float
    fuel_ratio: float
    created_at: datetime

    class Config:
        from_attributes = True


class HaulingResponse(BaseModel):
    id: int
    equipment_id: int
    fuel_reference_id: int
    distance_km: float
    created_at: datetime
    equipment: Optional[EquipmentResponse] = None
    fuel_reference: Optional[FuelReferenceResponse] = None
    summary: Optional[HaulingSummaryResponse] = None

    class Config:
        from_attributes = True


class HaulingSummaryDetailResponse(BaseModel):
    id: int
    hauling_id: int
    unit_type: str
    fuel_type: str
    distance_km: float
    fuel_cons: float
    productivity: float
    fuel_ratio: float
    created_at: datetime

    class Config:
        from_attributes = True
