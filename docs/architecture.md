# Arsitektur Sistem

## Gambaran umum

```text
Next.js frontend
  └─ ContractorFuelRatioDashboard
      └─ frontend/src/lib/api.ts
          └─ FastAPI backend (/api/v1)
              ├─ API routers
              ├─ services
              ├─ repositories
              ├─ SQLAlchemy models
              └─ SQLite database (frms.db)
```

## Backend

- `backend/main.py` membuat tabel database, memastikan kolom runtime tambahan tersedia, mendaftarkan konfigurasi fuzzy aktif, lalu mendaftarkan seluruh router.
- `backend/app/api/` berisi route HTTP untuk contractor, equipment, fuel reference, transaksi Loading/Hauling/Supporting/Dewatering, monitoring, dan alignment.
- `backend/app/services/` berisi aturan bisnis dan kalkulasi.
- `backend/app/repositories/` berisi akses data SQLAlchemy.
- `backend/app/models/` berisi model database.
- `backend/app/fuzzy_engine/` berisi membership function, rule base, dan inferensi Mamdani.
- `backend/seed.py` memuat data master dari `backend/data/` dan membuat data contoh transaksi.

## Frontend

Dashboard aktif berada pada `frontend/src/components/dashboard/ContractorFuelRatioDashboard.tsx`. Komponen ini:

1. Memuat contractor, equipment, dan summary setiap aktivitas.
2. Menggabungkan summary dengan master equipment berdasarkan `unit_type`.
3. Menghitung metrik contractor, ranking, activity breakdown, dan fleet yang terlihat.
4. Menyediakan filter contractor secara lokal pada dashboard.

Route dashboard lain masih berupa placeholder dan belum menjadi sumber data monitoring aktif.

## Fuzzy risk

`get_units_for_activity()` memperkaya `UnitRecord` dengan:

- `fuzzyRiskScore` — skor risiko 0 sampai 1.
- `fuzzyRiskLevel` — `LOW`, `NORMAL`, atau `HIGH`.
- `fuzzyDominantRules` — aturan yang paling dominan.
- `fuzzyMembership` — nilai membership tiap variabel.

Konfigurasi fuzzy aktif disimpan pada tabel `fuzzy_configuration` agar perubahan rule dapat dilacak berdasarkan versi.

## Data dan migrasi

Database default adalah SQLite `backend/frms.db`. Startup menjalankan `ensure_runtime_schema()` untuk menambahkan kolom runtime yang belum ada secara non-destruktif. Ini bukan pengganti migration system seperti Alembic.

Seeder bersifat destruktif terhadap database demo karena menjalankan `drop_all()` sebelum `create_all()`. Gunakan hanya untuk database lokal atau setelah membuat backup.
