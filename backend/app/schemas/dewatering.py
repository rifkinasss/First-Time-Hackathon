from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.equipment import EquipmentResponse
from app.schemas.fuel_reference import FuelReferenceResponse


class DewateringCreate(BaseModel):
    equipment_id: int = Field(..., description="ID equipment dewatering (misal DNDLSA6X8)")
    fuel_reference_id: int = Field(..., description="ID fuel reference yang digunakan")
    pa: float = Field(default=0.90, gt=0, le=1.0, description="Physical Availability (0.90 = 90%)")
    ua: float = Field(default=0.63, gt=0, le=1.0, description="Use of Availability (0.63 = 63%)")
    ewh: float = Field(default=4899.0, gt=0, description="Effective Working Hours (jam)")
    total_mine_prod_bcm: float = Field(default=91276500.0, gt=0, description="Total produksi BCM tambang/lokasi")


class DewateringCalculateRequest(BaseModel):
    unit_type: str = Field(..., description="Unit type equipment (misal: DNDLSA6X8)")
    fuel_type: str = Field(..., description="Tipe fuel reference (misal: KSB)")
    pa: float = Field(default=0.90, gt=0, le=1.0, description="Physical Availability (0.90 = 90%)")
    ua: float = Field(default=0.63, gt=0, le=1.0, description="Use of Availability (0.63 = 63%)")
    ewh: float = Field(default=4899.0, gt=0, description="Effective Working Hours (jam)")
    total_mine_prod_bcm: float = Field(default=91276500.0, gt=0, description="Total produksi BCM tambang/lokasi")


class DewateringSummaryResponse(BaseModel):
    id: int
    dewatering_id: int
    pa: float
    ua: float
    ewh: float
    fuel_cons_lhr: float
    total_fuel_liters: float
    total_mine_prod_bcm: float
    fuel_ratio: float
    created_at: datetime

    class Config:
        from_attributes = True


class DewateringResponse(BaseModel):
    id: int
    equipment_id: int
    fuel_reference_id: int
    pa: float
    ua: float
    ewh: float
    total_mine_prod_bcm: float
    created_at: datetime
    equipment: Optional[EquipmentResponse] = None
    fuel_reference: Optional[FuelReferenceResponse] = None
    summary: Optional[DewateringSummaryResponse] = None

    class Config:
        from_attributes = True


class DewateringSummaryDetailResponse(BaseModel):
    id: int
    dewatering_id: int
    unit_type: str
    fuel_type: str
    pa: float
    ua: float
    ewh: float
    fuel_cons_lhr: float
    total_fuel_liters: float
    total_mine_prod_bcm: float
    fuel_ratio: float
    created_at: datetime

    class Config:
        from_attributes = True


class DewateringBatchCalculateRequest(BaseModel):
    pa: float = Field(default=0.90, gt=0, le=1.0, description="Physical Availability (0.90 = 90%)")
    ua: float = Field(default=0.63, gt=0, le=1.0, description="Use of Availability (0.63 = 63%)")
    ewh: float = Field(default=4899.0, gt=0, description="Effective Working Hours (jam)")
    total_mine_prod_bcm: float = Field(default=91276500.0, gt=0, description="Total produksi BCM tambang/lokasi")


class DewateringBatchResponse(BaseModel):
    total_units_processed: int
    total_fuel_liters: float
    total_mine_prod_bcm: float
    overall_fuel_ratio: float
    details: List[DewateringSummaryDetailResponse]
