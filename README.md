# Fuel Ratio Monitoring System (FRMS)

FRMS adalah aplikasi monitoring konsumsi bahan bakar dan fuel ratio untuk aktivitas pertambangan: Loading, Hauling, Supporting, dan Dewatering. Sistem juga menyediakan evaluasi performa kontraktor, analisis penyelarasan terhadap SPO, dan penilaian risiko berbasis fuzzy Mamdani.

Repository ini terdiri dari:

- `backend/` — REST API FastAPI, database SQLite/SQLAlchemy, calculation engine, dan fuzzy inference.
- `frontend/` — aplikasi Next.js untuk dashboard multi-kontraktor.
- `docs/` — dokumentasi teknis dan product requirement.

## Status implementasi

Backend utama aktif melalui `backend/main.py` dan mendaftarkan router dengan prefix `/api/v1`. Halaman frontend yang aktif adalah dashboard multi-kontraktor pada route `/`.

Beberapa halaman pada `frontend/src/app/dashboard/` masih berupa placeholder. Selain itu, client API pada `frontend/src/lib/api.ts` masih memakai path lama seperti `/contractor` dan `/equipment`, sedangkan backend memakai `/api/v1/contractors` dan `/api/v1/equipments`. Path tersebut perlu diselaraskan sebelum integrasi frontend–backend digunakan pada deployment.

## Menjalankan backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

API tersedia di `http://127.0.0.1:8000`. Dokumentasi interaktif tersedia di:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

Seeder menghapus dan membuat ulang tabel database sebelum memuat CSV. Jangan menjalankan `python seed.py` pada database operasional tanpa backup.

## Menjalankan frontend

```powershell
cd frontend
npm install
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:8000"
npm run dev
```

Frontend tersedia di `http://localhost:3000`.

## Konfigurasi backend

Buat `backend/.env` bila ingin mengubah nilai default:

```env
APP_NAME=Fuel Ratio Monitoring System
APP_VERSION=0.1.0
DEBUG=true
DATABASE_URL=sqlite:///./frms.db
```

## Pengujian

Backend:

```powershell
cd backend
pytest -q
```

Frontend:

```powershell
cd frontend
npm run build
```

## Dokumentasi lanjutan

- [Dokumentasi proyek](docs/docs.md)
- [Referensi API](docs/api.md)
- [Arsitektur sistem](docs/architecture.md)
- [Data dictionary dan ERD](docs/data-dictionary.md)
- [Aturan perhitungan](docs/calculation-rules.md)
- [Fuzzy Mamdani](docs/fuzzy-mamdani.md)
- [User flow](docs/user-flows.md)
- [Product Requirements Document](docs/prd-frms.md)
