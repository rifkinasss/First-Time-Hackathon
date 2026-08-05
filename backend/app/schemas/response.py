from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone

T = TypeVar("T")


class MetaInfo(BaseModel):
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Waktu eksekusi ISO 8601 UTC"
    )
    execution_time_ms: Optional[str] = Field(None, description="Durasi eksekusi request di backend (misal: 1.25 ms)")
    total_count: Optional[int] = Field(None, description="Total record (jika response berupa array)")
    page: Optional[int] = Field(None, description="Nomor halaman (jika terpaginasi)")
    page_size: Optional[int] = Field(None, description="Ukuran halaman (jika terpaginasi)")


class APIResponse(BaseModel, Generic[T]):
    """Standard Unified API Success Response Envelope."""
    success: bool = Field(True, description="Status keberhasilan request")
    code: int = Field(200, description="HTTP Status Code")
    message: str = Field("Success", description="Pesan deskriptif hasil operasi")
    data: T = Field(..., description="Payload data utama")
    meta: Optional[MetaInfo] = Field(default_factory=MetaInfo, description="Metadata pendukung")


class APIErrorDetail(BaseModel):
    field: Optional[str] = Field(None, description="Nama field yang mengalami kendala/validasi error")
    message: str = Field(..., description="Detail rincian error")


class APIErrorResponse(BaseModel):
    """Standard Unified API Error Response Envelope."""
    success: bool = Field(False, description="Status kegagalan request")
    code: int = Field(..., description="HTTP Status Code error")
    message: str = Field(..., description="Pesan utama error")
    errors: Optional[List[APIErrorDetail]] = Field(None, description="Daftar rincian error jika ada")
    meta: Optional[MetaInfo] = Field(default_factory=MetaInfo, description="Metadata pendukung")


def create_success_response(
    data: Any,
    message: str = "Success",
    code: int = 200,
    total_count: Optional[int] = None,
    execution_time_ms: Optional[str] = None,
) -> dict:
    """Helper untuk memformat response sukses secara otomatis."""
    meta = MetaInfo()
    if total_count is not None:
        meta.total_count = total_count
    if execution_time_ms is not None:
        meta.execution_time_ms = execution_time_ms

    return {
        "success": True,
        "code": code,
        "message": message,
        "data": data,
        "meta": meta.model_dump()
    }
