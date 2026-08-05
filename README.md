# Fuel Ratio Monitoring System (FRMS)

FRMS adalah aplikasi untuk memantau konsumsi bahan bakar, fuel ratio, produktivitas, dan performa kontraktor pada aktivitas pertambangan:

- Loading
- Hauling
- Supporting
- Dewatering

Sistem juga menyediakan perhitungan terhadap target SPO, analisis alignment, dan penilaian risiko kontraktor menggunakan fuzzy Mamdani.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| Calculation engine | Service Python untuk Loading, Hauling, Supporting, dan Dewatering |
| Risk engine | Fuzzy Mamdani dengan konfigurasi yang disimpan di database |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Data awal | CSV demo dan database SQLite |
| Pengujian | pytest, httpx, ESLint, Next.js build |

## Struktur repository

```text
backend/    REST API, model database, service perhitungan, fuzzy engine, dan seed data
frontend/   Dashboard Next.js
docs/       PRD, arsitektur, kontrak API, formula, ERD, fuzzy, dan user flow
```

## Status implementasi

| Area | Status | Catatan |
|---|---|---|
| REST API backend | Aktif | Berjalan dengan prefix `/api/v1` |
| Master contractor, equipment, dan fuel reference | Aktif | CRUD tersedia melalui API |
| Perhitungan Loading, Hauling, Supporting, Dewatering | Aktif | Mendukung input aktual dan referensi |
| Monitoring dan trend | Aktif | Ringkasan dan filter tersedia melalui API |
| Fuzzy Mamdani | Aktif | Digunakan untuk penilaian risiko kontraktor |
| Alignment terhadap SPO | Aktif | Menyediakan variance dan action items |
| Dashboard root `/` | Aktif | Dashboard multi-kontraktor |
| Halaman dashboard lainnya | Placeholder | Belum seluruhnya terhubung ke API |
| Integrasi client API frontend | Perlu penyelarasan | Beberapa path lama belum memakai prefix `/api/v1` |

Status ini dicantumkan agar dokumentasi tidak menyamakan fitur yang sudah tersedia di backend dengan halaman frontend yang masih placeholder.

## Prasyarat

Pastikan perangkat sudah memiliki:

- Git
- Python 3.11 atau lebih baru
- Node.js 20 atau lebih baru dan npm
- PowerShell untuk perintah Windows pada contoh di bawah

Versi dependency Python didefinisikan di `backend/requirements.txt`, sedangkan versi dependency frontend didefinisikan di `frontend/package.json` dan dikunci oleh `frontend/package-lock.json`.

## Menjalankan project

Panduan setup lengkap, termasuk verifikasi dan troubleshooting, tersedia di [`docs/setup.md`](docs/setup.md). Ringkasan cepatnya:

### 1. Menjalankan backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

Backend tersedia di `http://127.0.0.1:8000`.

### 2. Menjalankan frontend

Buka terminal kedua:

```powershell
cd frontend
npm ci
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:8000"
npm run dev
```

Frontend tersedia di `http://localhost:3000`.

### 3. Memverifikasi aplikasi

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Dashboard: `http://localhost:3000`

Seeder menghapus dan membuat ulang tabel database sebelum memuat data demo dari CSV. Jangan menjalankan `python seed.py` pada database operasional tanpa backup.

## Pengujian

Backend:

```powershell
cd backend
pytest -q
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## Dokumentasi

- [Panduan setup dan troubleshooting](docs/setup.md)
- [Indeks dokumentasi](docs/docs.md)
- [Referensi API](docs/api.md)
- [Arsitektur sistem](docs/architecture.md)
- [Data dictionary dan ERD](docs/data-dictionary.md)
- [Aturan perhitungan](docs/calculation-rules.md)
- [Dokumentasi Fuzzy Mamdani](docs/fuzzy-mamdani.md)
- [User flow](docs/user-flows.md)
- [Product Requirements Document](docs/prd-frms.md)
