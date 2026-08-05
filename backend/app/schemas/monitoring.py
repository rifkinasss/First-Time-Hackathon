from __future__ import annotations
from typing import Any, Dict, Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


ActivityName = Literal["loading", "hauling", "supporting", "dewatering"]


class UnitRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    unitType: str
    category: Optional[str] = None
    contractor: str
    qty: int = Field(ge=0)
    fuelConsumption: float = Field(ge=0)
    productivity: Optional[float] = Field(default=None, ge=0)
    PA: Optional[float] = Field(default=None, ge=0, le=1)
    UA: Optional[float] = Field(default=None, ge=0, le=1)
    EWH: Optional[float] = Field(default=None, ge=0)
    fuelRatio: float = Field(ge=0)
    spoTarget: float = Field(ge=0)
    variancePct: float
    fuzzyRiskScore: Optional[float] = Field(default=None, ge=0, le=1)
    fuzzyRiskLevel: Optional[Literal["LOW", "NORMAL", "HIGH"]] = None
    fuzzyDominantRules: Optional[str] = None
    fuzzyMembership: Optional[Dict[str, Dict[str, float]]] = None


class TrendPoint(BaseModel):
    date: str
    actualFR: float
    spoFR: float
    fuelConsumption: float
    production: float


class ActivitySummary(BaseModel):
    activity: str
    label: str
    actualFR: float
    spoFR: float
    variancePct: float
    fuelConsumption: float
    productivity: float
    equipmentCount: int


class ActivityResponse(BaseModel):
    activity: str
    label: str
    units: List[UnitRecord]
    trend: List[TrendPoint]
    summary: ActivitySummary
    contractors: List[str]


class OverviewResponse(BaseModel):
    totalFuelConsumption: float
    totalProduction: float
    averageFuelRatio: float
    totalContractors: int
    totalEquipment: int
    averageProductivity: float
    trend: List[TrendPoint]
    activities: List[ActivitySummary]
