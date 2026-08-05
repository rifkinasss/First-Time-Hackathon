from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ContractorCreate(BaseModel):
    code: str = Field(..., description="Kode kontraktor unik (misal: PTA)")
    company_name: str = Field(..., description="Nama perusahaan kontraktor")
    status: str = Field(default="active", description="Status kontraktor: active / inactive")


class ContractorUpdate(BaseModel):
    company_name: Optional[str] = None
    status: Optional[str] = None


class ContractorResponse(BaseModel):
    id: int
    code: str
    company_name: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContractorPerformanceResponse(BaseModel):
    contractor_id: int
    code: str
    company_name: str
    actual_productivity: float = Field(..., description="Produktivitas aktual (BCM atau BCM/hr)")
    target_productivity: float = Field(..., description="Target produktivitas standar SPO")
    actual_fuel_cons: float = Field(..., description="Total konsumsi bahan bakar aktual (Liter)")
    actual_fuel_ratio: float = Field(..., description="Fuel ratio aktual (L/BCM)")
    target_fuel_ratio: float = Field(..., description="Target fuel ratio SPO (L/BCM)")
    productivity_variance_pct: float = Field(..., description="Persentase variansi produktivitas vs SPO (%)")
    fuel_ratio_variance_pct: float = Field(..., description="Persentase variansi fuel ratio vs SPO (%)")
    performance_status: str = Field(..., description="Status performa: HIGH_PERFORMANCE | ON_TARGET | UNDERPERFORMING | PRODUCTIVE_BUT_INEFFICIENT")
    rule_applied: str = Field(..., description="Aturan inferensi yang digunakan")
    insight: str = Field(..., description="Analisis & rekomendasi manajemen berdasarkan Rule 1")
