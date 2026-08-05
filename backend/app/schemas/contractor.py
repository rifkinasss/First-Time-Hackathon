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
