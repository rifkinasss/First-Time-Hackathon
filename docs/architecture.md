# Arsitektur dan Status Integrasi

## Gambaran sistem

FRMS terdiri dari frontend Next.js dan backend FastAPI. Ada dua model data yang saat ini hidup berdampingan:

1. **Database API aktif** — dijalankan oleh `backend/main.py`, memakai SQLAlchemy dan SQLite. API ini menangani master data serta transaksi kalkulasi.
2. **Monitoring snapshot API** — didefinisikan di `backend/app/api.py`, memakai `backend/data/seed.json` secara read-only untuk overview, unit register, dan trend 21 hari.

Kedua jalur tersebut belum disatukan di satu aplikasi FastAPI. `main.py` hanya me-include router dari `backend/app/api/`, bukan object `app` dari `backend/app/api.py`.

## Alur database API

```text
CSV seed
   │
   ▼
seed.py ──► SQLite (frms.db)
                │
                ▼
Frontend / client ──► FastAPI main.py (/api/v1)
                          │
                          ▼
                   API router
                          │
                          ▼
                 service calculation engine
                          │
                          ▼
                    repository ──► SQLAlchemy models
```

Saat `main.py` diimpor, `Base.metadata.create_all(bind=engine)` memastikan tabel tersedia. Data tidak otomatis di-seed oleh startup; gunakan `seed.py` untuk mengisi ulang database dari CSV.

## Alur monitoring snapshot

```text
seed.json ──► app/data.py ──► app/calculations.py
                                  │
                                  ├── make_summary()
                                  ├── filtered_units()
                                  └── app/trends.py
                                           │
                                           ▼
                                app/api.py (/api/overview)
                                app/api.py (/api/fuel-ratio/*)
```

Snapshot ini memiliki aturan kalkulasi sendiri untuk data dashboard. Ia tidak membaca `frms.db` dan tidak menyimpan hasil request.

## Struktur layer backend

- `app/api/` — route HTTP dan dependency database.
- `app/services/` — orkestrasi transaksi dan kalkulasi bisnis.
- `app/repositories/` — operasi query/create pada database.
- `app/models/` — tabel SQLAlchemy dan relasi.
- `app/schemas/` — validasi payload dan serialisasi response.
- `app/database/` — engine, session factory, dan dependency `get_db`.
- `app/config.py`, `app/data.py`, `app/calculations.py`, `app/trends.py` — konfigurasi dan jalur snapshot read-only.

## Struktur frontend

- `src/app/` — route App Router.
- `src/components/` — shell, dashboard, chart, filter, table, dan badge.
- `src/lib/frms-types.ts` — tipe response monitoring snapshot.
- `src/lib/mock-data.ts` — fallback data lokal untuk rancangan monitoring.
- `src/lib/api.ts` — client HTTP untuk master data dan summary database.
- `src/lib/filters.ts` — state filter monitoring.

`src/app/layout.tsx` membungkus semua route dengan `FrmsShell`. Route `/` masih memakai komponen dashboard kontraktor lama, sementara `/overview` dan `/fuel-ratio/[activity]` memakai dashboard FRMS baru.

## Konfigurasi koneksi

Backend membaca:

```text
DATABASE_URL=sqlite:///./frms.db
```

Frontend membaca:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Pastikan URL tersebut menunjuk ke app FastAPI yang memang menyediakan endpoint yang dipanggil client. Lihat [Referensi API](api.md) untuk matriks endpoint.

## Known limitations

Berikut kondisi yang teridentifikasi dari source code saat ini:

- `frontend/src/components/overview-page.tsx` mengimpor `getOverview`, tetapi fungsi tersebut belum diekspor dari `frontend/src/lib/api.ts`.
- `frontend/src/components/activity-page.tsx` mengimpor `getActivity`, tetapi fungsi tersebut juga belum diekspor.
- `frontend/src/lib/api.ts` memanggil path lama seperti `/contractor`, `/equipment`, dan `/loading/summary`, sedangkan app aktif menyediakan `/api/v1/contractors`, `/api/v1/equipments`, dan `/api/v1/loadings/summary`.
- Endpoint snapshot `/api/overview` dan `/api/fuel-ratio/{activity}` tersedia di object app dalam `backend/app/api.py`, tetapi tidak tersedia ketika server dijalankan dengan `uvicorn main:app`.
- Halaman Reports belum memiliki export PDF/Excel; route-nya melakukan redirect.
- Authentication, role management, forecasting, AI recommendation, notifikasi, dan integrasi IoT belum tersedia.
- `main.py` menggunakan `allow_origins=["*"]`; ubah menjadi daftar origin yang eksplisit sebelum deployment.

## Rekomendasi urutan penyelarasan

1. Tentukan satu kontrak API resmi: database API `/api/v1` atau snapshot API `/api`.
2. Mount router monitoring ke `main.py`, atau ubah client frontend agar memakai database API yang sudah ada.
3. Implementasikan `getOverview` dan `getActivity` serta fallback `mock-data` bila API tidak tersedia.
4. Tambahkan integration test frontend-backend sebelum mengaktifkan deployment.
