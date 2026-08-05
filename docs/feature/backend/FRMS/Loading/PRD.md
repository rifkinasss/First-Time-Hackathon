# Product Requirement Document (PRD)

# Fuel Ratio Monitoring System
## Module: Loading
### Version 0.1 (MVP)

---

# 1. Overview

## Project Name

Fuel Ratio Monitoring System

## Module

Loading Fuel Ratio

## Objective

Membangun engine perhitungan Fuel Ratio untuk aktivitas Loading berdasarkan Standar Parameter Operational (SPO).

Tahap pertama hanya berfokus pada proses perhitungan Fuel Ratio dan belum mencakup:

- Authentication
- Dashboard
- Database
- Reporting
- AI Recommendation
- Hauling
- Supporting
- Dewatering

---

# 2. Goals

Membuat sistem yang mampu:

- menerima data SPO Loading
- melakukan validasi input
- menghitung Fuel Ratio
- menghasilkan output yang identik dengan perhitungan Excel SPO

---

# 3. Out of Scope

Fitur berikut tidak termasuk dalam MVP.

- Login
- User Management
- CRUD Master Data
- Dashboard
- Reporting
- Import Excel
- Export Excel
- Database
- AI
- Forecast
- Notification

---

# 4. Business Rule

Fuel Ratio dihitung menggunakan rumus:

Fuel Ratio

=
Σ(Qty × Fuel Consumption)

────────────────────────

Σ(Qty × Productivity)

Keterangan

Total Fuel

Σ(Qty × Fuel Consumption)

Total Productivity

Σ(Qty × Productivity)

Fuel Ratio

Total Fuel / Total Productivity

---

# 5. Input

Setiap row memiliki data berikut.

| Field | Type | Required |
|--------|------|----------|
| unit_type | string | Yes |
| qty | integer | Yes |
| fuel_cons | float | Yes |
| productivity | float | Yes |

Contoh

| Unit | Qty | Fuel Cons | Productivity |
|------|----:|----------:|-------------:|
| EX26007 | 3 | 187 | 920 |
| PC125011R | 18 | 59 | 310 |

---

# 6. Validation

Rule

qty > 0

fuel_cons > 0

productivity > 0

rows tidak boleh kosong

---

# 7. Process

1.

Hitung Total Fuel

Σ(Qty × Fuel Cons)

2.

Hitung Total Productivity

Σ(Qty × Productivity)

3.

Hitung Fuel Ratio

Total Fuel

──────────────

Total Productivity

4.

Bulatkan menjadi 2 digit desimal.

---

# 8. Output

Response

```json
{
    "total_fuel": 5836,
    "total_productivity": 37660,
    "fuel_ratio": 0.15
}
```

---

# 9. API

Method

POST

Endpoint

/api/loading/calculate

Request

```json
{
  "rows":[
      {
          "unit_type":"EX26007",
          "qty":3,
          "fuel_cons":187,
          "productivity":920
      }
  ]
}
```

Response

```json
{
    "total_fuel":5836,
    "total_productivity":37660,
    "fuel_ratio":0.15
}
```

---

# 10. Folder Structure

backend/

app/

loading/

router.py

schemas.py

engine.py

validator.py

core/

main.py

tests/

test_loading.py

---

# 11. Testing

Scenario 1

Valid Data

Expected

Fuel Ratio sesuai Excel.

Scenario 2

Qty = 0

Expected

Validation Error.

Scenario 3

Fuel = 0

Expected

Validation Error.

Scenario 4

Productivity = 0

Expected

Validation Error.

Scenario 5

Rows kosong

Expected

Validation Error.

---

# 12. Success Criteria

Engine menghasilkan Fuel Ratio identik dengan Excel SPO.

Seluruh validation berjalan.

API dapat menerima request.

API mengembalikan hasil perhitungan.

Unit test seluruh skenario berhasil.

---

# 13. Next Phase

Setelah Loading selesai

Module berikutnya

- Hauling
- Supporting
- Dewatering

Kemudian

Dashboard

Reporting

Database

AI Recommendation

Forecast