from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class EquipmentCreate(BaseModel):
    contractor_id: int = Field(..., description="ID kontraktor pemilik equipment")
    unit_type: str = Field(..., description="Tipe unit (misal: EX26007)")
    item: str = Field(..., description="Nama item/alat")
    activity: str = Field(..., description="Aktivitas (misal: Loading)")
    qty: int = Field(..., gt=0, description="Jumlah unit")
    productivity: Optional[float] = Field(None, description="Produktivitas per unit (BCM/hr). Kosong/null untuk Supporting & Dewatering")


class EquipmentUpdate(BaseModel):
    unit_type: Optional[str] = None
    item: Optional[str] = None
    activity: Optional[str] = None
    qty: Optional[int] = Field(None, gt=0)
    productivity: Optional[float] = Field(None, gt=0)


class EquipmentResponse(BaseModel):
    id: int
    contractor_id: int
    unit_type: str
    item: str
    activity: str
    qty: int
    productivity: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
