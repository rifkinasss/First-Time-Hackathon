# FRMS / Operations Control

MVP Fuel Ratio Monitoring System untuk monitoring konsumsi fuel berbasis aktivitas produksi. Cakupan target ini: Overview, Loading, Hauling, Supporting, dan Dewatering.

## Menjalankan aplikasi

### Backend FastAPI

Gunakan Python 3.12+; Python 3.14 juga didukung.

```powershell
cd .\backend\
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Struktur backend dipecah menjadi modul konfigurasi, schema, data, kalkulasi,
trend, dan API di dalam [backend/app](backend/app).

API tersedia di `http://localhost:8000`; dokumentasi OpenAPI ada di `/docs`.

### Frontend Next.js

```powershell
cd .\frontend\
npm install
npm run dev
```

Buka `http://localhost:3000`. Frontend mencoba API FastAPI terlebih dahulu dan otomatis memakai seed snapshot lokal bila backend belum dijalankan.

## Endpoint MVP

- `GET /api/overview`
- `GET /api/fuel-ratio/{activity}` untuk `loading`, `hauling`, `supporting`, atau `dewatering`
- Filter activity: `from`, `to`, `contractor`, `unit`

Seed data ada di [backend/data/seed.json](backend/data/seed.json). Data mendukung migrasi ke database karena kalkulasi, schema Pydantic, dan response API sudah dipisahkan dari layer UI.
