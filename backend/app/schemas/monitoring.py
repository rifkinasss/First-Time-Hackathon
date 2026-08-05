from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class UnitRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    unitType: str
    category: str | None = None
    contractor: str
    qty: int = Field(ge=0)
    fuelConsumption: float = Field(ge=0)
    productivity: float | None = Field(default=None, ge=0)
    PA: float | None = Field(default=None, ge=0, le=1)
    UA: float | None = Field(default=None, ge=0, le=1)
    EWH: float | None = Field(default=None, ge=0)
    fuelRatio: float = Field(ge=0)
    spoTarget: float = Field(ge=0)
    variancePct: float


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
    units: list[UnitRecord]
    trend: list[TrendPoint]
    summary: ActivitySummary
    contractors: list[str]


class OverviewResponse(BaseModel):
    totalFuelConsumption: float
    totalProduction: float
    averageFuelRatio: float
    totalContractors: int
    totalEquipment: int
    averageProductivity: float
    trend: list[TrendPoint]
    activities: list[ActivitySummary]
