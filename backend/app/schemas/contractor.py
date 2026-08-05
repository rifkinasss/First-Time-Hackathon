from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Dict, Optional, List, Literal


class ContractorCreate(BaseModel):
    code: str = Field(..., description="Kode kontraktor unik (misal: PTA)")
    company_name: str = Field(..., description="Nama perusahaan kontraktor")
    status: str = Field(default="active", description="Status kontraktor: active / inactive")


class ContractorUpdate(BaseModel):
    company_name: Optional[str] = None
    status: Optional[str] = None


class ContractorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    company_name: str
    status: str
    created_at: datetime
    updated_at: datetime


class ContractorActivityFuelRatio(BaseModel):
    activity: str = Field(..., description="Aktivitas (loading, hauling, supporting, dewatering)")
    label: str = Field(..., description="Label aktivitas")
    actual_fuel_ratio: float = Field(..., description="Fuel ratio aktual aktivitas ini")
    target_fuel_ratio: float = Field(..., description="Target fuel ratio SPO aktivitas ini")
    actual_productivity: float = Field(..., description="Produktivitas (BCM/hrs)")
    actual_fuel_cons: float = Field(..., description="Total fuel cons (Liter)")
    equipment_count: int = Field(..., description="Jumlah armada unit dalam aktivitas ini")


class ContractorEquipmentFuelRatio(BaseModel):
    equipment_id: int = Field(..., description="ID Equipment")
    unit_type: str = Field(..., description="Tipe unit (misal: EX26007, HD7857)")
    item: str = Field(..., description="Kategori/item alat")
    activity: str = Field(..., description="Aktivitas (loading, hauling, supporting, dewatering)")
    qty: int = Field(..., description="Jumlah unit")
    actual_fuel_cons: float = Field(..., description="Konsumsi fuel per unit/armada (Liter)")
    actual_productivity: Optional[float] = Field(None, description="Produktivitas unit (BCM/hrs)")
    actual_fuel_ratio: float = Field(..., description="Fuel ratio aktual unit ini")
    target_fuel_ratio: float = Field(..., description="Target fuel ratio SPO unit ini")
    variance_pct: float = Field(..., description="Persentase variansi fuel ratio unit ini vs SPO (%)")


class ContractorPerformanceResponse(BaseModel):
    contractor_id: int
    code: str
    company_name: str
    actual_productivity: float = Field(..., description="Produktivitas aktual keseluruhan (BCM)")
    target_productivity: float = Field(..., description="Target produktivitas standar SPO (BCM)")
    actual_fuel_cons: float = Field(..., description="Total konsumsi bahan bakar aktual (Liter)")
    actual_fuel_ratio: float = Field(..., description="Fuel ratio rata-rata keseluruhan (L/BCM)")
    target_fuel_ratio: float = Field(..., description="Target fuel ratio rata-rata SPO (L/BCM)")
    productivity_variance_pct: float = Field(..., description="Persentase variansi produktivitas vs SPO (%)")
    fuel_ratio_variance_pct: float = Field(..., description="Persentase variansi fuel ratio vs SPO (%)")
    support_dewatering_population: int = Field(0, description="Total populasi unit Supporting + Dewatering")
    support_dewatering_fuel_cons: float = Field(0.0, description="Total konsumsi fuel Supporting + Dewatering")
    support_dewatering_fuel_share_pct: float = Field(0.0, description="Kontribusi fuel Supporting + Dewatering terhadap total fuel (%)")
    support_dewatering_fuel_ratio: float = Field(0.0, description="Akumulasi Fuel Ratio Supporting + Dewatering")
    performance_status: str = Field(..., description="Status performa: HIGH_PERFORMANCE | ON_TARGET | UNDERPERFORMING | PRODUCTIVE_BUT_INEFFICIENT")
    rule_applied: str = Field(..., description="Aturan inferensi yang digunakan")
    insight: str = Field(..., description="Analisis & rekomendasi manajemen berdasarkan Rule 1")
    activity_breakdowns: List[ContractorActivityFuelRatio] = Field(default_factory=list, description="Rincian Fuel Ratio per Aktivitas Operasional Kontraktor")
    equipment_breakdowns: List[ContractorEquipmentFuelRatio] = Field(default_factory=list, description="Rincian Fuel Ratio per Kendaraan / Equipment Kontraktor")


class ContractorFuzzyRiskResponse(BaseModel):
    contractor_id: int
    code: str
    company_name: str
    productivity: Optional[float] = Field(None, description="Produktivitas Loading rata-rata kontraktor")
    support_dewatering_population: int = Field(..., description="Populasi unit Supporting + Dewatering")
    fuel_deviation_ratio: float = Field(..., description="Total fuel actual dibandingkan total fuel reference")
    support_dewatering_fuel_share_pct: float = Field(..., description="Kontribusi fuel Supporting + Dewatering (%)")
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: Literal["LOW", "NORMAL", "HIGH"]
    dominant_rules: str
    membership: Dict[str, Dict[str, float]]
    config_version: str
