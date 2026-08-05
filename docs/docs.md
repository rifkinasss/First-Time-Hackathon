# Dokumentasi FRMS

Dokumentasi ini mengikuti kondisi source code saat ini. Untuk mulai menjalankan project, baca [README.md](../README.md).

## Dokumen

| Dokumen | Isi |
| --- | --- |
| [README](../README.md) | Prasyarat, instalasi, route frontend, testing, dan struktur repository |
| [Architecture](architecture.md) | Alur data, pembagian layer, konfigurasi, dan known limitations |
| [API Reference](api.md) | Endpoint FastAPI database dan monitoring snapshot |
| [Calculation Rules](calculation-rules.md) | Rumus Loading, Hauling, Supporting, Dewatering, dan Rule 1 |
| [PRD FRMS](prd-frms.md) | Product requirement dan target modul |
| [Loading PRD](feature/backend/FRMS/Loading/PRD.md) | Requirement historis untuk modul Loading |

## Kontrak runtime yang perlu diperhatikan

- Jalankan `uvicorn main:app` untuk database API aktif dengan prefix `/api/v1`.
- `backend/app/api.py` adalah app snapshot terpisah dan belum di-mount oleh `main.py`.
- Frontend masih memiliki integration gap; lihat [Known limitations](architecture.md#known-limitations) sebelum menganggap semua halaman siap dipakai.

## Pemeliharaan dokumentasi

Jika route, schema, formula, sumber data, atau perintah startup berubah, perbarui README dan dokumen API/arsitektur pada perubahan yang sama.
