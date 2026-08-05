# Referensi API

## Cara membaca dokumentasi ini

App yang dijalankan dengan `uvicorn main:app --reload --port 8000` memakai base URL:

```text
http://127.0.0.1:8000/api/v1
```

Dokumentasi interaktif tersedia di:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/redoc`

Semua endpoint di bawah ini berasal dari router yang di-include oleh `backend/main.py`.

## Health check

### `GET /`

Response contoh:

```json
{
  "message": "Fuel Ratio Monitoring System API",
  "version": "0.1.0"
}
```

Middleware juga menambahkan header `X-Process-Time` dan `Server-Timing`.

## Master data

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/contractors` | Daftar kontraktor |
| `POST` | `/contractors` | Membuat kontraktor baru |
| `GET` | `/contractors/{contractor_id}` | Detail kontraktor |
| `GET` | `/equipments` | Daftar equipment |
| `POST` | `/equipments` | Membuat equipment baru |
| `GET` | `/fuel-references` | Daftar referensi fuel |
| `POST` | `/fuel-references` | Membuat referensi fuel baru |
| `GET` | `/haulings/distance-ref` | Daftar referensi jarak dan BCM/hour |

Contoh membuat kontraktor:

```powershell
curl.exe -X POST http://127.0.0.1:8000/api/v1/contractors `
  -H "Content-Type: application/json" `
  -d '{"code":"PTZ","company_name":"PT Zeta Mining","status":"active"}'
```

## Loading

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/loadings/calculate` | Kalkulasi batch dari row input, atau kalkulasi transaksi dari unit/fuel reference |
| `GET` | `/loadings/summary` | Daftar summary Loading |

Format batch yang divalidasi:

```json
{
  "rows": [
    {
      "unit_type": "EX26007",
      "qty": 3,
      "fuel_cons": 187,
      "productivity": 920
    },
    {
      "unit_type": "PC125011R",
      "qty": 18,
      "fuel_cons": 59,
      "productivity": 310
    }
  ]
}
```

Response batch:

```json
{
  "total_fuel": 1623,
  "total_productivity": 8340,
  "fuel_ratio": 0.19
}
```

`qty`, `fuel_cons`, dan `productivity` harus lebih besar dari nol dan `rows` tidak boleh kosong. Batch ini menghitung response langsung dan tidak membuat row transaksi database.

## Hauling

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/haulings/calculate` | Kalkulasi berdasarkan unit, tipe fuel, dan jarak km |
| `GET` | `/haulings/distance-ref` | Referensi jarak/cycle/BCM per jam |
| `GET` | `/haulings/summary` | Daftar summary Hauling |
| `GET` | `/haulings/{hauling_id}` | Detail transaksi Hauling |

Request:

```json
{
  "unit_type": "HD7857",
  "fuel_type": "HD785-7",
  "distance_km": 3.9
}
```

Sistem mencari `bcm_per_hr` dari tabel referensi berdasarkan `distance_km`. Jika tidak ditemukan, engine menggunakan produktivitas equipment, atau fallback `110.0` BCM/hour jika produktivitas equipment tidak tersedia.

## Supporting

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/supportings/calculate` | Kalkulasi satu unit Supporting |
| `POST` | `/supportings/calculate-all` | Kalkulasi seluruh equipment dengan activity Supporting |
| `GET` | `/supportings/summary` | Daftar summary Supporting |
| `GET` | `/supportings/{supporting_id}` | Detail transaksi Supporting |

Request satu unit:

```json
{
  "unit_type": "CAT14M3",
  "fuel_type": "14M",
  "pa": 0.9,
  "ua": 0.53,
  "ewh": 4121,
  "total_mine_prod_bcm": 91276500
}
```

`pa` dan `ua` berada pada rentang `0 < nilai <= 1`. Nilai default adalah PA 0.90, UA 0.53, EWH 4121 jam, dan produksi tambang 91,276,500 BCM.

## Dewatering

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/dewaterings/calculate` | Kalkulasi satu unit Dewatering |
| `POST` | `/dewaterings/calculate-all` | Kalkulasi seluruh equipment dengan activity Dewatering |
| `GET` | `/dewaterings/summary` | Daftar summary Dewatering |
| `GET` | `/dewaterings/{dewatering_id}` | Detail transaksi Dewatering |

Request satu unit:

```json
{
  "unit_type": "DNDLSA6X8",
  "fuel_type": "KSB",
  "pa": 0.9,
  "ua": 0.63,
  "ewh": 4899,
  "total_mine_prod_bcm": 91276500
}
```

Nilai default Dewatering adalah PA 0.90, UA 0.63, EWH 4899 jam, dan produksi tambang 91,276,500 BCM.

## Evaluasi performa kontraktor

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/contractors/performance` | Evaluasi seluruh kontraktor |
| `GET` | `/contractors/{contractor_id}/performance` | Evaluasi satu kontraktor |

Response dibungkus dalam format:

```json
{
  "success": true,
  "code": 200,
  "message": "Evaluasi performa seluruh kontraktor berhasil diproses.",
  "data": [],
  "total_count": 0,
  "execution_time_ms": "0.00 ms"
}
```

Status yang dapat dihasilkan adalah `HIGH_PERFORMANCE`, `ON_TARGET`, `UNDERPERFORMING`, `PRODUCTIVE_BUT_INEFFICIENT`, atau `NO_DATA`.

## Monitoring snapshot — belum terpasang di `main.py`

`backend/app/api.py` mendefinisikan app FastAPI terpisah dengan endpoint:

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/overview` | KPI gabungan dan trend 21 hari |
| `GET` | `/api/fuel-ratio/{activity}` | Unit, summary, trend, dan filter activity |

Activity yang valid: `loading`, `hauling`, `supporting`, `dewatering`.

Filter yang tersedia pada endpoint activity:

| Query | Format | Keterangan |
| --- | --- | --- |
| `from` | `YYYY-MM-DD` | Batas awal trend |
| `to` | `YYYY-MM-DD` | Batas akhir trend |
| `contractor` | string | Filter exact match, case-insensitive |
| `unit` | string | Pencarian pada unit type atau category |

App tersebut dapat dijalankan terpisah dari folder `backend` untuk inspeksi snapshot:

```powershell
uvicorn app.api:app --reload --port 8001
```

Perintah tersebut tidak menggantikan app aktif `main:app` dan tidak memakai database SQLite.

## Error umum

- `422 Unprocessable Entity` — payload gagal validasi Pydantic atau filter tanggal tidak valid.
- `404 Not Found` — equipment, fuel reference, transaksi, atau activity tidak ditemukan.
- `400 Bad Request` — kode kontraktor duplikat.

Untuk bentuk detail error, gunakan Swagger UI karena schema response mengikuti FastAPI/Pydantic.
