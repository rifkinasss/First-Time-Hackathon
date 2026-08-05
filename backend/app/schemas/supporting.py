from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.schemas.equipment import EquipmentResponse
from app.schemas.fuel_reference import FuelReferenceResponse


class SupportingCreate(BaseModel):
    equipment_id: int = Field(..., description="ID equipment pendukung (misal CAT14M3)")
    fuel_reference_id: int = Field(..., description="ID fuel reference yang digunakan")
    pa: float = Field(default=0.90, gt=0, le=1.0, description="Physical Availability (0.90 = 90%)")
    ua: float = Field(default=0.53, gt=0, le=1.0, description="Use of Availability (0.53 = 53%)")
    ewh: float = Field(default=4121.0, gt=0, description="Effective Working Hours (jam)")
    total_mine_prod_bcm: float = Field(default=91276500.0, gt=0, description="Total produksi BCM tambang/lokasi")
    fuel_consumed_liters: Optional[float] = Field(None, ge=0, description="Fuel actual selama periode (Liter)")
    operating_hours: Optional[float] = Field(None, gt=0, description="Jam operasi aktual selama periode")


class SupportingCalculateRequest(BaseModel):
    unit_type: str = Field(..., description="Unit type equipment (misal: CAT14M3)")
    fuel_type: str = Field(..., description="Tipe fuel reference (misal: CAT14M3)")
    pa: float = Field(default=0.90, gt=0, le=1.0, description="Physical Availability (0.90 = 90%)")
    ua: float = Field(default=0.53, gt=0, le=1.0, description="Use of Availability (0.53 = 53%)")
    ewh: float = Field(default=4121.0, gt=0, description="Effective Working Hours (jam)")
    total_mine_prod_bcm: float = Field(default=91276500.0, gt=0, description="Total produksi BCM tambang/lokasi")
    fuel_consumed_liters: Optional[float] = Field(None, ge=0, description="Fuel actual selama periode (Liter)")
    operating_hours: Optional[float] = Field(None, gt=0, description="Jam operasi aktual selama periode")


class SupportingSummaryResponse(BaseModel):
    id: int
    supporting_id: int
    pa: float
    ua: float
    ewh: float
    fuel_cons_lhr: float
    total_fuel_liters: float
    total_mine_prod_bcm: float
    fuel_ratio: float
    fuel_cons_reference: Optional[float] = None
    fuel_cons_actual: Optional[float] = None
    fuel_ratio_reference: Optional[float] = None
    fuel_ratio_actual: Optional[float] = None
    data_source: str = "OEM_REFERENCE"
    created_at: datetime

    class Config:
        from_attributes = True


class SupportingResponse(BaseModel):
    id: int
    equipment_id: int
    fuel_reference_id: int
    pa: float
    ua: float
    ewh: float
    total_mine_prod_bcm: float
    fuel_consumed_liters: Optional[float] = None
    operating_hours: Optional[float] = None
    data_source: str = "OEM_REFERENCE"
    created_at: datetime
    equipment: Optional[EquipmentResponse] = None
    fuel_reference: Optional[FuelReferenceResponse] = None
    summary: Optional[SupportingSummaryResponse] = None

    class Config:
        from_attributes = True


class SupportingSummaryDetailResponse(BaseModel):
    id: int
    supporting_id: int
    unit_type: str
    fuel_type: str
    pa: float
    ua: float
    ewh: float
    fuel_cons_lhr: float
    total_fuel_liters: float
    total_mine_prod_bcm: float
    fuel_ratio: float
    fuel_cons_reference: Optional[float] = None
    fuel_cons_actual: Optional[float] = None
    fuel_ratio_reference: Optional[float] = None
    fuel_ratio_actual: Optional[float] = None
    data_source: str = "OEM_REFERENCE"
    created_at: datetime

    class Config:
        from_attributes = True


class SupportingBatchCalculateRequest(BaseModel):
    pa: float = Field(default=0.90, gt=0, le=1.0, description="Physical Availability (0.90 = 90%)")
    ua: float = Field(default=0.53, gt=0, le=1.0, description="Use of Availability (0.53 = 53%)")
    ewh: float = Field(default=4121.0, gt=0, description="Effective Working Hours (jam)")
    total_mine_prod_bcm: float = Field(default=91276500.0, gt=0, description="Total produksi BCM tambang/lokasi")
    fuel_consumed_liters: Optional[float] = Field(None, ge=0)
    operating_hours: Optional[float] = Field(None, gt=0)


class SupportingBatchResponse(BaseModel):
    total_units_processed: int
    total_fuel_liters: float
    total_mine_prod_bcm: float
    overall_fuel_ratio: float
    details: list[SupportingSummaryDetailResponse]
