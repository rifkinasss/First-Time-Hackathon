# Rumus dan Aturan Kalkulasi

Dokumen ini membedakan dua engine yang ada di repository: engine transaksi database dan engine snapshot dashboard.

## Istilah

- `qty` — jumlah unit equipment.
- `fuel_cons` / `average` — konsumsi fuel, umumnya liter per jam.
- `productivity` — produktivitas unit, umumnya BCM per jam.
- `PA` — Physical Availability, dalam bentuk desimal, misalnya `0.90` berarti 90%.
- `UA` — Use of Availability, dalam bentuk desimal.
- `EWH` — Effective Working Hours.
- `FR` — Fuel Ratio, konsumsi fuel per BCM. Semakin kecil umumnya semakin efisien.
- `SPO` — Standar Parameter Operasional.

## Engine transaksi database

### Loading

Pada kalkulasi batch:

```text
total_fuel         = Σ(qty × fuel_cons)
total_productivity = Σ(qty × productivity)
fuel_ratio         = round(total_fuel / total_productivity, 2)
```

Pada kalkulasi transaksi database, `fuel_cons` berasal dari `qty × fuel_reference.average` dan `productivity` berasal dari `qty × equipment.productivity`.

Validasi penting:

- `qty > 0`
- `fuel_cons > 0`
- `productivity > 0`
- daftar batch tidak boleh kosong

### Hauling

```text
bcm_per_hr   = lookup(distance_km pada hauling_distance_ref)
fuel_cons    = equipment.qty × fuel_reference.average
productivity = equipment.qty × bcm_per_hr
fuel_ratio   = round(fuel_cons / productivity, 2)
```

Jika jarak tidak ada pada referensi, engine menggunakan produktivitas equipment. Jika nilai tersebut juga tidak positif, fallback yang digunakan adalah `110.0` BCM/hour.

### Supporting dan Dewatering

```text
fuel_cons_lhr     = qty × average
total_fuel_liters = qty × PA × UA × EWH × average
fuel_ratio        = round(total_fuel_liters / total_mine_prod_bcm, 4)
```

Input `PA`, `UA`, `EWH`, dan `total_mine_prod_bcm` harus lebih besar dari nol. `PA` dan `UA` tidak boleh lebih besar dari `1.0`.

Endpoint `calculate-all` mencari semua equipment berdasarkan nilai activity, kemudian mencocokkan fuel reference secara bertahap berdasarkan unit type, merk, atau activity.

## Evaluasi performa kontraktor

Service kontraktor menerapkan Rule 1:

```text
Productivity naik + Fuel Ratio turun  => HIGH_PERFORMANCE
Productivity turun + Fuel Ratio naik  => UNDERPERFORMING
Productivity naik + Fuel Ratio naik  => PRODUCTIVE_BUT_INEFFICIENT
Kondisi lain                         => ON_TARGET
```

Kontraktor tanpa equipment menghasilkan status `NO_DATA`.

## Engine snapshot dashboard

Engine di `backend/app/calculations.py` memakai `seed.json`, bukan hasil transaksi SQLite.

Untuk Loading dan Hauling, weighted fuel ratio dihitung sebagai:

```text
FR = Σ(qty × fuel_consumption) / Σ(qty × productivity)
```

Untuk Supporting dan Dewatering, engine membentuk `EWH` dari:

```text
EWH = PA × UA × HOURS_PER_YEAR
```

Pada konfigurasi saat ini `HOURS_PER_YEAR = 24 × 360`. Fuel ratio per unit lalu dihitung menggunakan total produksi tahunan:

```text
FR = (qty × EWH × fuel_consumption) / TOTAL_ANNUAL_PRODUCTION_BCM
```

Target SPO yang digunakan snapshot saat ini:

| Activity | SPO fuel ratio |
| --- | ---: |
| Loading | 0.1325 |
| Hauling | 0.6007 |
| Supporting | 0.1879 |
| Dewatering | 0.3233 |

Variance dihitung dengan:

```text
variance_pct = ((actual - target) / target) × 100
```

Trend snapshot dibuat secara deterministik untuk 21 hari dari baseline `2026-07-01`; trend tersebut bukan telemetry real-time.
