# API Contract FRMS

Dokumen ini adalah kontrak integrasi antara frontend dan backend. Source of truth untuk validasi tetap berada pada schema Pydantic di `backend/app/schemas/` dan route di `backend/app/api/`.

## 1. Base URL dan response

Jalankan backend dari folder `backend`:

```powershell
uvicorn main:app --reload --port 8000
```

Base URL:

```text
http://127.0.0.1:8000/api/v1
```

### 1.1 Response envelope

Sebagian besar endpoint mengembalikan:

```json
{
  "success": true,
  "code": 200,
  "message": "Success",
  "data": {},
  "meta": {
    "timestamp": "2026-08-05T00:00:00+00:00",
    "execution_time_ms": "1.25 ms",
    "total_count": null,
    "page": null,
    "page_size": null
  }
}
```

`data` dapat berupa object, array, atau hasil kalkulasi. `meta.total_count` diisi untuk response array jika route menyediakannya.

Endpoint yang response-nya langsung tanpa envelope ditandai pada tabel di bawah. Frontend tidak boleh mengasumsikan semua endpoint memiliki bentuk response yang sama.

### 1.2 Error

Error validasi FastAPI dapat berbentuk:

```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "qty"],
      "msg": "Input should be greater than 0"
    }
  ]
}
```

Error bisnis biasanya mengembalikan `detail` berupa string. Status umum:

| Status | Arti |
|---|---|
| `200` | Request berhasil |
| `201` | Resource berhasil dibuat |
| `404` | Resource atau aktivitas tidak ditemukan |
| `409` | Konflik data, misalnya kode contractor duplikat |
| `422` | Payload atau parameter tidak valid |

## 2. Kontrak frontend–backend

Client saat ini (`frontend/src/lib/api.ts`) masih memanggil beberapa path legacy. Mapping yang harus digunakan pada integrasi berikutnya:

| Client saat ini | Route backend yang benar | Status |
|---|---|---|
| `/contractor` | `/api/v1/contractors` | Perlu diselaraskan |
| `/equipment` | `/api/v1/equipments` | Perlu diselaraskan |
| `/loading/summary` | `/api/v1/loadings/summary` | Perlu diselaraskan |
| `/hauling/summary` | `/api/v1/haulings/summary` | Perlu diselaraskan |
| `/supporting/summary` | `/api/v1/supportings/summary` | Perlu diselaraskan |
| `/dewatering/summary` | `/api/v1/dewaterings/summary` | Perlu diselaraskan |

Selain path, client perlu membaca `response.data` untuk endpoint yang memakai envelope. Endpoint yang mengembalikan direct payload perlu dibaca langsung.

## 3. Contractors

### GET `/contractors`

Mengambil seluruh contractor. Response memakai envelope dengan `data: ContractorResponse[]`.

### POST `/contractors`

Request:

```json
{
  "code": "PTA",
  "company_name": "PT. A",
  "status": "active"
}
```

`code` dan `company_name` wajib. `status` default `active`.

### GET `/contractors/{contractor_id}`

Mengambil detail satu contractor. Response memakai envelope dengan `data: ContractorResponse`.

### PUT `/contractors/{contractor_id}`

Request parsial:

```json
{
  "company_name": "PT. A Updated",
  "status": "active"
}
```

### DELETE `/contractors/{contractor_id}`

Menghapus contractor jika tidak memiliki data terkait. Response memakai envelope dengan data `{ "contractor_id": 1 }`.

## 4. Equipment

### GET `/equipments`

Response memakai envelope dengan `data: EquipmentResponse[]`.

### POST `/equipments`

Request:

```json
{
  "contractor_id": 1,
  "unit_type": "EX26007",
  "item": "Excavator OB",
  "activity": "Loading",
  "qty": 3,
  "productivity": 920
}
```

`qty` harus lebih besar dari 0. `productivity` boleh null untuk Supporting dan Dewatering.

### PUT `/equipments/{equipment_id}`

Request parsial dengan field `unit_type`, `item`, `activity`, `qty`, dan/atau `productivity`.

### GET `/equipments/{equipment_id}` dan DELETE `/equipments/{equipment_id}`

Keduanya memakai response envelope.

## 5. Fuel reference

### GET `/fuel-references`

Mengambil master reference fuel. Response memakai envelope.

### POST `/fuel-references`

Request:

```json
{
  "merk": "KOMATSU",
  "type": "HD785-7",
  "activity": "Hauling",
  "average": 77,
  "low": 65,
  "mid": 77,
  "high": 90
}
```

Semua nilai konsumsi harus lebih besar dari 0. Endpoint `PUT /fuel-references/{ref_id}` menerima field parsial. GET detail dan DELETE juga tersedia dan memakai envelope.

## 6. Calculation API

### 6.1 Loading

#### POST `/loadings/calculate`

Single calculation:

```json
{
  "unit_type": "EX26007",
  "fuel_type": "EX2600-6"
}
```

Batch calculation:

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

Batch response berada di dalam envelope:

```json
{
  "total_fuel": 1623,
  "total_productivity": 8340,
  "fuel_ratio": 0.19
}
```

`qty`, `fuel_cons`, dan `productivity` harus lebih besar dari 0. `GET /loadings/summary` dan `POST /loadings/summary/backfill` juga memakai envelope.

### 6.2 Hauling

#### POST `/haulings/calculate`

```json
{
  "unit_type": "HD7857",
  "fuel_type": "HD785-7",
  "distance_km": 3.9
}
```

`distance_km` harus lebih besar dari 0 dan default-nya `3.90`. Response kalkulasi langsung berupa `HaulingResponse`, bukan envelope.

Endpoint lain:

| Method | Path | Response |
|---|---|---|
| GET | `/haulings/distance-ref` | Array langsung |
| GET | `/haulings/summary` | Array langsung |
| GET | `/haulings/{hauling_id}` | Envelope |
| DELETE | `/haulings/{hauling_id}` | Envelope |

### 6.3 Supporting

#### POST `/supportings/calculate`

```json
{
  "unit_type": "CAT14M3",
  "fuel_type": "CAT14M3",
  "pa": 0.9,
  "ua": 0.53,
  "ewh": 4121,
  "total_mine_prod_bcm": 91276500,
  "fuel_consumed_liters": 1000,
  "operating_hours": 120
}
```

`pa` dan `ua` berada pada rentang `0 < nilai <= 1`. Field `fuel_consumed_liters` boleh null; `ewh` dan `total_mine_prod_bcm` harus lebih besar dari 0.

#### POST `/supportings/calculate-all`

Memakai body yang sama tanpa `unit_type` dan `fuel_type`, lalu menghitung seluruh equipment Supporting. Response langsung berupa:

```json
{
  "total_units_processed": 1,
  "total_fuel_liters": 1234.5,
  "total_mine_prod_bcm": 91276500,
  "overall_fuel_ratio": 0.0001,
  "details": []
}
```

`GET /supportings/summary` mengembalikan array langsung; GET detail dan DELETE memakai envelope.

### 6.4 Dewatering

Kontrak sama dengan Supporting, dengan default:

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

Endpoint tersedia:

| Method | Path | Response |
|---|---|---|
| POST | `/dewaterings/calculate` | Object langsung |
| POST | `/dewaterings/calculate-all` | Object langsung |
| GET | `/dewaterings/summary` | Array langsung |
| GET | `/dewaterings/{dewatering_id}` | Envelope |
| DELETE | `/dewaterings/{dewatering_id}` | Envelope |

## 7. Monitoring

### GET `/monitoring/overview`

Mengembalikan ringkasan seluruh aktivitas. Saat ini tidak menerima query filter.

### GET `/monitoring/fuel-ratio/{activity}`

`activity` harus salah satu dari `loading`, `hauling`, `supporting`, atau `dewatering`.

Query parameter:

| Parameter | Format | Perilaku |
|---|---|---|
| `from` | `YYYY-MM-DD` | Batas awal trend |
| `to` | `YYYY-MM-DD` | Batas akhir trend |
| `contractor` | string | Pencarian nama contractor, case-insensitive |
| `unit` | string | Pencarian pada `unitType` atau `category`, case-insensitive |

Contoh:

```text
GET /api/v1/monitoring/fuel-ratio/loading?from=2026-07-01&to=2026-07-31&contractor=PT.%20A&unit=EX26007
```

Response `data` berisi:

```json
{
  "activity": "loading",
  "label": "Loading",
  "units": [],
  "trend": [],
  "summary": {},
  "contractors": []
}
```

Filter contractor/unit memengaruhi `units` dan `summary`. Filter tanggal hanya membatasi `trend` karena unit register belum memiliki tanggal transaksi individual.

## 8. Contractor analysis

Semua endpoint berikut memakai envelope:

| Method | Path | Data |
|---|---|---|
| GET | `/contractors/performance` | `ContractorPerformanceResponse[]` |
| GET | `/contractors/{id}/performance` | `ContractorPerformanceResponse` |
| GET | `/contractors/fuzzy-risk` | `ContractorFuzzyRiskResponse[]` |
| GET | `/contractors/{id}/fuzzy-risk` | `ContractorFuzzyRiskResponse` |

Field utama fuzzy risk:

- `risk_score`: angka `0–1`;
- `risk_level`: `LOW`, `NORMAL`, atau `HIGH`;
- `dominant_rules`: rule yang dominan;
- `membership`: membership variable;
- `config_version`: versi konfigurasi fuzzy.

## 9. SPO alignment

### GET `/alignments/summary`

Query parameter:

| Parameter | Default | Keterangan |
|---|---:|---|
| `fuel_price` | `15000` | Harga fuel dalam IDR/liter |
| `target_bcm` | otomatis | Target produksi BCM |

### POST `/alignments/simulate`

```json
{
  "actual_fuel_cons_liters": 1604100,
  "actual_production_bcm": 1289100,
  "target_spo_fuel_ratio": 1.2444,
  "target_production_bcm": 91276500,
  "fuel_price_per_liter": 15000
}
```

Semua input simulasi harus lebih besar dari 0. Hasil berisi fuel variance, cost impact, production gap, target FR, status alignment, action items, dan breakdown per aktivitas.

## 10. Checklist integrasi frontend

- [ ] Tambahkan prefix `/api/v1` pada client API.
- [ ] Ubah pembacaan envelope menjadi `response.data` pada route yang sesuai.
- [ ] Bedakan route direct payload dan route envelope.
- [ ] Sinkronkan nama field snake_case backend dengan tipe frontend.
- [ ] Tambahkan handling `422`, `404`, dan `409`.
- [ ] Tambahkan test contract untuk minimal satu endpoint tiap kelompok: master data, calculation, monitoring, fuzzy, dan alignment.
