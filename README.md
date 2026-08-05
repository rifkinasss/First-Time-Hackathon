# FRMS / Operations Control

Fuel Ratio Monitoring System (FRMS) adalah dashboard operasional untuk memantau efisiensi konsumsi bahan bakar berdasarkan aktivitas pertambangan dan kontraktor. Aktivitas yang dicakup adalah Loading, Hauling, Supporting, dan Dewatering.

Repository ini berisi dua aplikasi:

- `backend/` — REST API FastAPI, kalkulasi fuel ratio, SQLAlchemy, dan SQLite.
- `frontend/` — dashboard Next.js App Router dengan TypeScript, Tailwind CSS, Recharts, dan TanStack Table.

## Status project

Project masih berada pada tahap MVP/prototipe. Backend database API dan data seed sudah tersedia, sedangkan integrasi dashboard monitoring frontend masih dalam proses penyelarasan.

Catatan penting:

- `backend/main.py` mengekspos API database di bawah prefix `/api/v1`.
- `backend/app/api.py` berisi API monitoring read-only berbasis `seed.json`, tetapi app tersebut belum di-include oleh `main.py`.
- Build frontend saat ini berhenti karena `getOverview` dan `getActivity` diimpor oleh halaman dashboard tetapi belum diekspor dari `frontend/src/lib/api.ts`. Detailnya ada di [Known limitations](docs/architecture.md#known-limitations).

Dokumentasi lengkap:

- [Arsitektur dan status integrasi](docs/architecture.md)
- [Referensi API](docs/api.md)
- [Rumus dan aturan kalkulasi](docs/calculation-rules.md)
- [PRD utama](docs/prd-frms.md)

## Fitur yang tersedia

### Dashboard frontend

- Overview fuel ratio operasional.
- Monitoring per aktivitas: Loading, Hauling, Supporting, dan Dewatering.
- Filter periode, kontraktor, dan unit pada desain halaman monitoring.
- Trend fuel ratio 21 hari pada API monitoring read-only.
- Ringkasan performa kontraktor dan armada pada halaman root lama.
- Halaman Reports dan beberapa dashboard lama masih berupa redirect/placeholder.

### Backend

- Master data kontraktor, equipment, fuel reference, dan referensi jarak hauling.
- Kalkulasi Loading, Hauling, Supporting, dan Dewatering.
- Kalkulasi batch untuk Loading, Supporting, dan Dewatering.
- Riwayat summary hasil kalkulasi.
- Evaluasi performa kontraktor berbasis Rule 1.
- OpenAPI/Swagger melalui `/docs` dan ReDoc melalui `/redoc`.

## Prasyarat

- Python 3.12 atau lebih baru. `requirements.txt` juga menyiapkan Pydantic yang kompatibel dengan CPython 3.14.
- Node.js 20.9 atau lebih baru untuk Next.js 16.
- npm.

## Menjalankan backend

```powershell
cd .\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Jika perintah `python` tidak tersedia di Windows, gunakan launcher Python yang terpasang, misalnya `py`.

API aktif di `http://127.0.0.1:8000`.

- Health/root: `http://127.0.0.1:8000/`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### Mengisi ulang database

Database SQLite default berada di `backend/frms.db`. Untuk memuat ulang data dari CSV, jalankan dari folder `backend`:

```powershell
python seed.py
```

Perhatian: `seed.py` menjalankan `drop_all()` sebelum membuat tabel kembali. Perintah ini menghapus data database lokal saat ini dan membuat sample transaction baru; jangan jalankan pada database yang datanya ingin dipertahankan tanpa backup.

File sumber seed:

- `backend/data/Contractor - Sheet1.csv`
- `backend/data/Equipment - Sheet1.csv`
- `backend/data/Ref Fuel - Sheet1.csv`
- `backend/data/Hauling Distance Ref - Sheet1.csv`

### Konfigurasi backend

Buat file `backend/.env` bila ingin mengubah default berikut:

```dotenv
APP_NAME=Fuel Ratio Monitoring System
APP_VERSION=0.1.0
DEBUG=true
DATABASE_URL=sqlite:///./frms.db
```

`DATABASE_URL` dapat diarahkan ke database SQLAlchemy lain, tetapi proses seed saat ini membaca CSV dan belum merupakan migration system.

## Menjalankan frontend

```powershell
cd .\frontend
npm ci
npm run dev
```

Frontend direncanakan tersedia di `http://localhost:3000`. URL backend dibaca dari `NEXT_PUBLIC_API_URL`; default-nya adalah `http://127.0.0.1:8000`.

```powershell
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:8000"
npm run dev
```

Perintah frontend lain:

```powershell
npm run lint
npm run build
npm run start
```

Karena integrasi API frontend belum selesai, `npm run build` belum lulus pada kondisi repository saat ini. Lihat bagian status di atas dan [arsitektur](docs/architecture.md).

## Route frontend

| Route | Keterangan |
| --- | --- |
| `/` | Halaman root lama untuk ringkasan kontraktor dan armada |
| `/overview` | Executive dashboard fuel ratio |
| `/fuel-ratio/loading` | Monitoring Loading |
| `/fuel-ratio/hauling` | Monitoring Hauling |
| `/fuel-ratio/supporting` | Monitoring Supporting |
| `/fuel-ratio/dewatering` | Monitoring Dewatering |
| `/dashboard/fuel-ratio-monitoring` | Redirect ke Loading |
| `/dashboard/contractor-performance` | Redirect ke Overview |
| `/dashboard/fuel-consumption` | Redirect ke Overview |
| `/dashboard/reports` | Redirect ke Overview |

## Struktur repository

```text
.
├── backend/
│   ├── main.py                 # FastAPI app aktif dan router /api/v1
│   ├── seed.py                 # Reset dan isi database dari CSV
│   ├── frms.db                 # SQLite lokal
│   ├── data/                   # CSV dan seed.json
│   ├── app/
│   │   ├── api/                # Router database API
│   │   ├── services/           # Business logic dan calculation engine
│   │   ├── repositories/       # Akses database
│   │   ├── models/             # Model SQLAlchemy
│   │   ├── schemas/            # Schema request/response Pydantic
│   │   ├── api.py              # App monitoring read-only terpisah
│   │   ├── calculations.py     # Kalkulasi snapshot dashboard
│   │   └── trends.py           # Generator trend 21 hari
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/                # Route Next.js App Router
│       ├── components/         # UI dashboard
│       └── lib/                # API client, type, filter, mock data
├── docs/
└── README.md
```

## Testing

Backend:

```powershell
cd .\backend
python -m pytest -q
```

Test yang tersedia mencakup kalkulasi batch Loading dan evaluasi performa kontraktor.

Frontend:

```powershell
cd .\frontend
npm run lint
npm run build
```

## Lisensi dan keamanan

Project ini belum memiliki authentication atau role management. CORS pada app aktif saat ini mengizinkan semua origin, sehingga konfigurasi tersebut perlu diperketat sebelum deployment. Jangan menaruh kredensial atau data operasional sensitif ke repository.
