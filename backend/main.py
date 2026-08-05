from fastapi import FastAPI
from app.core.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 — register semua model sebelum create_all
from app.api.equipment import router as equipment_router
from app.api.fuel_reference import router as fuel_reference_router
from app.api.loading import router as loading_router
from app.api.contractor import router as contractor_router
from app.api.hauling import router as hauling_router
from app.api.supporting import router as supporting_router
from app.api.dewatering import router as dewatering_router

# Buat semua tabel jika belum ada
Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=f"{settings.APP_NAME} RESTful API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Execution Time Middleware ─────────────────────────────────────────────
import time
from fastapi import Request


@app.middleware("http")
async def add_execution_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time"] = f"{process_time_ms:.2f} ms"
    response.headers["Server-Timing"] = f"app;dur={process_time_ms:.2f}"
    return response

# ─── RESTful API v1 Routes ───────────────────────────────────────────────────
app.include_router(contractor_router, prefix="/api/v1")
app.include_router(equipment_router, prefix="/api/v1")
app.include_router(fuel_reference_router, prefix="/api/v1")
app.include_router(loading_router, prefix="/api/v1")
app.include_router(hauling_router, prefix="/api/v1")
app.include_router(supporting_router, prefix="/api/v1")
app.include_router(dewatering_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
    }
