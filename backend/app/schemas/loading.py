from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.schemas.equipment import EquipmentResponse
from app.schemas.fuel_reference import FuelReferenceResponse


# ─── Create ───────────────────────────────────────────────────────────────────

class LoadingCreate(BaseModel):
    equipment_id: int = Field(..., description="ID equipment yang digunakan")
    fuel_reference_id: int = Field(..., description="ID fuel reference yang digunakan")


# ─── Request ──────────────────────────────────────────────────────────────────

class LoadingCalculateRequest(BaseModel):
    unit_type: str = Field(..., description="Unit type equipment (misal: EX26007)")
    fuel_type: str = Field(..., description="Tipe fuel reference (misal: PC200)")


# ─── Summary Response ─────────────────────────────────────────────────────────

class LoadingSummaryResponse(BaseModel):
    id: int
    loading_id: int
    fuel_cons: float        # equipment.qty × fuel_reference.average
    productivity: float     # equipment.qty × equipment.productivity
    fuel_ratio: float       # round(fuel_cons / productivity, 2)
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Loading Detail Response ──────────────────────────────────────────────────

class LoadingResponse(BaseModel):
    id: int
    equipment_id: int
    fuel_reference_id: int
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
    created_at: datetime

    class Config:
        from_attributes = True
