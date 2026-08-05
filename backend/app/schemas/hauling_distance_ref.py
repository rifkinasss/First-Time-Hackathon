from pydantic import BaseModel, Field
from datetime import datetime


class HaulingDistanceRefResponse(BaseModel):
    id: int
    km: float
    load_time: float
    haul_time: float
    dump_time: float
    return_time: float
    cycle_time: float
    bcm_per_hr: float
    created_at: datetime

    class Config:
        from_attributes = True
