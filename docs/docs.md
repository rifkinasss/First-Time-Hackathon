# Dokumentasi FRMS

Dokumentasi ini mengikuti struktur kode pada repository saat ini.

| Dokumen | Isi |
|---|---|
| [README](../README.md) | Tujuan proyek, status implementasi, instalasi, dan cara menjalankan aplikasi |
| [Panduan Setup](setup.md) | Prasyarat, instalasi, seed data, verifikasi, konfigurasi, dan troubleshooting |
| [API Contract](api.md) | Endpoint FastAPI, payload, format response, validasi, error, dan mapping frontend |
| [Architecture](architecture.md) | Alur frontend, backend, database, calculation engine, dan fuzzy engine |
| [Data Dictionary dan ERD](data-dictionary.md) | Tabel, field, relasi, sumber data, dan diagram database |
| [Calculation Rules](calculation-rules.md) | Formula, fallback, validasi, pembulatan, dan sumber implementasi |
| [Fuzzy Mamdani](fuzzy-mamdani.md) | Membership function, rule base, defuzzification, dan interpretasi risiko |
| [User Flows](user-flows.md) | Alur pengguna dashboard, master data, kalkulasi, monitoring, fuzzy, dan alignment |
| [FRMS PRD](prd-frms.md) | Requirement produk dan ruang lingkup bisnis |

## Ringkasan route aktif

- `/` — dashboard performa multi-kontraktor.
- `/dashboard/fuel-ratio-monitoring` — placeholder halaman monitoring.
- `/dashboard/fuel-consumption` — placeholder halaman fuel consumption.
- `/dashboard/contractor-performance` — placeholder halaman evaluasi performa kontraktor.
- `/dashboard/reports` — placeholder halaman laporan.

## Catatan integrasi

Backend menggunakan route `/api/v1/...` dan response envelope `{ success, code, message, data, meta }` pada sebagian besar endpoint. Client frontend saat ini masih memiliki beberapa path legacy tanpa prefix `/api/v1` dan beberapa endpoint lama yang belum mengikuti envelope tersebut. Penyelarasan client API menjadi pekerjaan integrasi berikutnya.
