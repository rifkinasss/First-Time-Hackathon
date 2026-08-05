from typing import Optional, List
from pydantic import BaseModel, Field


class AlignmentSimulationRequest(BaseModel):
    actual_fuel_cons_liters: float = Field(..., gt=0, description="Total konsumsi fuel aktual (Liter)")
    actual_production_bcm: float = Field(..., gt=0, description="Total produksi aktual (BCM)")
    target_spo_fuel_ratio: float = Field(..., gt=0, description="Target Fuel Ratio standar SPO (L/BCM)")
    target_production_bcm: float = Field(..., gt=0, description="Target rencana produksi tambang (BCM)")
    fuel_price_per_liter: float = Field(default=15000.0, description="Harga patokan bahan bakar per liter (IDR)")


class AlignmentCategoryBreakdown(BaseModel):
    activity: str = Field(..., description="Nama aktivitas (loading, hauling, supporting, dewatering)")
    actual_fuel_liters: float
    target_spo_fuel_liters: float
    fuel_variance_liters: float = Field(..., description="Selisih fuel (positif = boros, negatif = hemat)")
    cost_variance_idr: float = Field(..., description="Estimasi selisih biaya fuel dalam IDR")
    actual_fuel_ratio: float
    target_spo_fuel_ratio: float
    status: str = Field(..., description="Status alignment: ALIGNED | OVER_CONSUMPTION | EFFICIENT")


class ReconciliationActionItem(BaseModel):
    category: str = Field(..., description="Kategori tindakan: FUEL_REDUCTION | PRODUCTION_ADJUSTMENT | FLEET_OPTIMIZATION | EFFICIENCY_MAINTENANCE | FINANCIAL_IMPACT | PRODUCTION_ALIGNMENT")
    title: str = Field(..., description="Judul ringkas rekomendasi operasional")
    description: str = Field(..., description="Detail rincian narasi formal profesional tanpa emoji")
    priority: str = Field(..., description="Tingkat prioritas: HIGH | MEDIUM | LOW")


class SPOAlignmentResponse(BaseModel):
    period: str = Field("Current Operational Period", description="Periode evaluasi operasional")
    actual_total_fuel_liters: float = Field(..., description="Total konsumsi bahan bakar aktual (Liter)")
    target_spo_fuel_liters: float = Field(..., description="Konsumsi bahan bakar yang seharusnya sesuai standar SPO (Liter)")
    fuel_variance_liters: float = Field(..., description="Kelebihan/pemborosan pemakaian bahan bakar (Liter)")
    fuel_variance_pct: float = Field(..., description="Persentase penyimpangan pemakaian fuel vs SPO (%)")
    cost_impact_idr: float = Field(..., description="Dampak finansial / kelebihan biaya bahan bakar (IDR)")
    
    actual_production_bcm: float = Field(..., description="Total produksi tambang aktual (BCM)")
    target_production_bcm: float = Field(..., description="Target rencana produksi tambang (BCM)")
    production_gap_bcm: float = Field(..., description="Selisih pencapaian produksi (BCM)")
    required_production_for_target_fr: float = Field(..., description="Produksi BCM yang harus dicapai agar FR sesuai target SPO")
    
    actual_fuel_ratio: float = Field(..., description="Fuel Ratio aktual (L/BCM)")
    target_spo_fuel_ratio: float = Field(..., description="Target Fuel Ratio SPO (L/BCM)")
    fuel_ratio_variance: float = Field(..., description="Selisih Fuel Ratio (L/BCM)")
    
    alignment_status: str = Field(..., description="Status penyelarasan: ALIGNED | OVER_BUDGET | HIGHLY_EFFICIENT")
    reconciliation_actions: List[ReconciliationActionItem] = Field(..., description="Daftar tindakan penyelarasan operasional profesional")
    category_breakdowns: List[AlignmentCategoryBreakdown] = Field(default_factory=list, description="Rincian penyelarasan per aktivitas operasional")
