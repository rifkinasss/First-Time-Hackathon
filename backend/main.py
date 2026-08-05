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
    title=settings.APP_NAME,
    description="Backend API untuk sistem monitoring fuel ratio pada aktivitas tambang",
    version=settings.APP_VERSION,
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
# GET    /equipment
# POST   /equipment
# GET    /fuel-reference
# POST   /fuel-reference
# POST   /loading/calculate
# GET    /loading/summary
app.include_router(contractor_router)
app.include_router(equipment_router)
app.include_router(fuel_reference_router)
app.include_router(loading_router)
app.include_router(hauling_router)
app.include_router(supporting_router)
app.include_router(dewatering_router)


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
    }
