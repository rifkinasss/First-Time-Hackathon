from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.schemas.equipment import EquipmentResponse
from app.schemas.fuel_reference import FuelReferenceResponse


# ─── Create ───────────────────────────────────────────────────────────────────

class LoadingCreate(BaseModel):
    equipment_id: int = Field(..., description="ID equipment yang digunakan")
    fuel_reference_id: int = Field(..., description="ID fuel reference yang digunakan")
    fuel_consumed_liters: Optional[float] = Field(None, gt=0, description="Total fuel aktual selama periode (liter)")
    operating_hours: Optional[float] = Field(None, gt=0, description="Jam operasi selama periode")


# ─── Request ──────────────────────────────────────────────────────────────────

class LoadingCalculateRequest(BaseModel):
    unit_type: str = Field(..., description="Unit type equipment (misal: EX26007)")
    fuel_type: str = Field(..., description="Tipe fuel reference (misal: PC200)")
    fuel_consumed_liters: Optional[float] = Field(None, gt=0, description="Total fuel aktual selama periode (liter)")
    operating_hours: Optional[float] = Field(None, gt=0, description="Jam operasi selama periode")


class LoadingRowInput(BaseModel):
    unit_type: str
    qty: int = Field(..., gt=0, description="Jumlah unit")
    fuel_cons: float = Field(..., gt=0, description="Konsumsi fuel per unit")
    productivity: float = Field(..., gt=0, description="Produktivitas per unit")


class LoadingBatchCalculateRequest(BaseModel):
    rows: list[LoadingRowInput] = Field(..., min_length=1, description="Daftar row unit")


class LoadingBatchCalculateResponse(BaseModel):
    total_fuel: float
    total_productivity: float
    fuel_ratio: float


# ─── Summary Response ─────────────────────────────────────────────────────────

class LoadingSummaryResponse(BaseModel):
    id: int
    loading_id: int
    fuel_cons: float        # equipment.qty × fuel_reference.average
    productivity: float     # equipment.qty × equipment.productivity
    fuel_ratio: float       # round(fuel_cons / productivity, 2)
    fuel_cons_reference: float = 0.0
    fuel_cons_actual: Optional[float] = None
    fuel_ratio_reference: float = 0.0
    fuel_ratio_actual: Optional[float] = None
    data_source: str = "OEM_REFERENCE"
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Loading Detail Response ──────────────────────────────────────────────────

class LoadingResponse(BaseModel):
    id: int
    equipment_id: int
    fuel_reference_id: int
    fuel_consumed_liters: Optional[float] = None
    operating_hours: Optional[float] = None
    created_at: datetime
    equipment: Optional[EquipmentResponse] = None
    fuel_reference: Optional[FuelReferenceResponse] = None
    summary: Optional[LoadingSummaryResponse] = None

    class Config:
        from_attributes = True


# ─── Summary List Response (untuk GET /loading/summary) ───────────────────────

class LoadingSummaryDetailResponse(BaseModel):
    id: int
    loading_id: int
    unit_type: str
    fuel_type: str
    fuel_cons: float
    productivity: float
    fuel_ratio: float
    fuel_cons_reference: float = 0.0
    fuel_cons_actual: Optional[float] = None
    fuel_ratio_reference: float = 0.0
    fuel_ratio_actual: Optional[float] = None
    data_source: str = "OEM_REFERENCE"
    created_at: datetime

    class Config:
        from_attributes = True
