# Dokumentasi Fuzzy Mamdani

## Tujuan

Fuzzy Mamdani menilai risiko fuel ratio contractor dari indikator produktivitas, populasi equipment, dan deviasi fuel terhadap reference. Hasilnya adalah score kontinu, level risiko, rule dominan, dan membership value.

Implementasi berada di `backend/app/fuzzy_engine/`.

## Versi konfigurasi

| Parameter | Nilai |
|---|---|
| Versi | `2026.08.1` |
| Operator AND | `MIN` |
| Agregasi rule | `MAX` |
| Defuzzification | `CENTROID` |
| Batas LOW | `<= 0.35` |
| Batas NORMAL | `> 0.35` sampai `<= 0.65` |
| Batas HIGH | `> 0.65` |

Konfigurasi aktif disimpan pada tabel `fuzzy_configuration`.

## Input model

### Productivity dan population

Kedua input dibentuk secara dinamis dari quartile dataset:

- `Q25` — batas bawah;
- `Q50` — median;
- `Q75` — batas atas.

Membership:

| Label | Bentuk | Parameter |
|---|---|---|
| `DOWN` | Left shoulder | Q25 → Q50 |
| `NORMAL` | Triangular | Q25, Q50, Q75 |
| `UP` | Right shoulder | Q50 → Q75 |

Jika productivity null, sistem memberi membership `NORMAL=1` sebagai asumsi netral.

### Fuel deviation ratio

```text
fuel_deviation_ratio = actual_fuel / fuel_reference
```

Membership fixed:

| Label | Bentuk | Parameter |
|---|---|---|
| `DOWN` | Left shoulder | `0.90, 1.00` |
| `NORMAL` | Triangular | `0.90, 1.00, 1.10` |
| `UP` | Right shoulder | `1.00, 1.10` |

Nilai di bawah 1.00 cenderung efisien; nilai di atas 1.00 cenderung menyimpang.

## Rule base

Antecedent menggunakan `MIN`; consequent dengan label yang sama diagregasikan menggunakan `MAX`.

| Rule | Kondisi | Consequent |
|---|---|---|
| `R1_productivity_up` | productivity `UP` | risk `DOWN` |
| `R2_population_up` | population `UP` | risk `UP` |
| `R3_fuel_up` | fuel `UP` | risk `UP` |
| `R4_low_productivity_high_population` | productivity `DOWN` AND population `UP` | risk `UP` |
| `R5_low_productivity_high_fuel` | productivity `DOWN` AND fuel `UP` | risk `UP` |
| `R6_normal_operation` | productivity `NORMAL` AND population `NORMAL` AND fuel `NORMAL` | risk `NORMAL` |
| `R7_optimal_operation` | productivity `UP` AND population `DOWN` AND fuel `DOWN` | risk `DOWN` |

Maksimal tiga rule dengan strength terbesar dikembalikan sebagai `dominant_rules`.

## Output membership dan defuzzification

| Label output | Bentuk | Parameter |
|---|---|---|
| `DOWN` | Left shoulder | `0.00, 0.50` |
| `NORMAL` | Triangular | `0.25, 0.50, 0.75` |
| `UP` | Right shoulder | `0.50, 1.00` |

Centroid dihitung pada 1001 titik dari 0.000 sampai 1.000:

```text
risk_score = Σ(score × membership(score)) / Σ(membership(score))
```

Jika tidak ada rule aktif, fallback score adalah `0.5`.

## Response

```json
{
  "risk_score": 0.72,
  "risk_level": "HIGH",
  "dominant_rules": "R3_fuel_up, R5_low_productivity_high_fuel",
  "config_version": "2026.08.1",
  "membership": {
    "productivity": {"DOWN": 0.8, "NORMAL": 0.2, "UP": 0.0},
    "population": {"DOWN": 0.0, "NORMAL": 0.3, "UP": 0.7},
    "fuel": {"DOWN": 0.0, "NORMAL": 0.0, "UP": 1.0}
  }
}
```

## Interpretasi

| Level | Makna | Tindakan awal |
|---|---|---|
| `LOW` | Kondisi relatif efisien | Pertahankan praktik dan monitor |
| `NORMAL` | Tidak ada sinyal risiko dominan | Monitoring berkala |
| `HIGH` | Ada kombinasi indikator yang berisiko | Audit fuel, idle time, fleet, dan produktivitas |

Score bukan keputusan otomatis untuk penalti contractor. Score harus dibaca bersama data transaksi dan konteks operasional.

## Batasan model

- Q25/Q50/Q75 bergantung pada populasi data saat inferensi.
- Dataset kecil dapat membuat membership kurang stabil.
- Model belum dikalibrasi terhadap label risiko historis yang disetujui bisnis.
- Tidak ada pembobotan waktu; record terbaru tidak otomatis lebih dominan.
- Perubahan rule atau threshold harus menaikkan `FUZZY_CONFIG_VERSION` dan diuji ulang.

## Sumber implementasi

- `backend/app/fuzzy_engine/config.py`
- `backend/app/fuzzy_engine/membership.py`
- `backend/app/fuzzy_engine/rulebase.py`
- `backend/app/fuzzy_engine/mamdani.py`
- `backend/app/services/contractor_service.py`
