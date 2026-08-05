# User Flow per Fitur

Dokumen ini menjelaskan alur pengguna pada MVP dan alur API yang menjadi dasar halaman lanjutan.

Legenda: `[User]` tindakan pengguna, `[UI]` frontend, `[API]` backend, `[DB]` database, `[Decision]` percabangan.

## 1. Membuka dashboard contractor

```mermaid
flowchart TD
    A([User membuka /]) --> B[UI memuat dashboard]
    B --> C[Ambil contractor, equipment, dan summary aktivitas]
    C --> D{Semua request berhasil?}
    D -- Tidak --> E[Tampilkan error dan tombol Coba lagi]
    E --> F([User klik Coba lagi])
    F --> C
    D -- Ya --> G[Gabungkan summary dengan master equipment]
    G --> H[Tampilkan KPI, ranking, breakdown, detail, dan fleet]
```

## 2. Filter contractor

```mermaid
flowchart TD
    A[Dashboard tampil] --> B[User memilih contractor]
    B --> C[UI mengubah selectedCode]
    C --> D[Filter contractor dan equipment secara lokal]
    D --> E[Hitung ulang KPI dan activity breakdown]
    E --> F[Tampilkan fleet dan tabel contractor terpilih]
    F --> G{User memilih Tampilkan semua?}
    G -- Ya --> H[Set selectedCode = ALL]
    H --> D
    G -- Tidak --> I([Selesai])
```

## 3. Refresh dashboard

```mermaid
flowchart TD
    A[User klik Perbarui data] --> B[Set loading = true]
    B --> C[Request ulang semua sumber data]
    C --> D{Berhasil?}
    D -- Ya --> E[Simpan data baru dan render ulang]
    D -- Tidak --> F[Simpan pesan error]
    E --> G([Dashboard siap])
    F --> H[Tampilkan error dan opsi Coba lagi]
```

## 4. CRUD master data

```mermaid
flowchart TD
    A[User membuka form master data] --> B[UI mengambil data referensi]
    B --> C[User mengisi atau mengubah form]
    C --> D[UI validasi field]
    D --> E{Valid?}
    E -- Tidak --> F[Tampilkan error field]
    F --> C
    E -- Ya --> G[POST atau PUT /api/v1]
    G --> H{API berhasil?}
    H -- Tidak --> I[Tampilkan error bisnis/validasi]
    I --> C
    H -- Ya --> J[DB commit]
    J --> K[Refresh list dan tampilkan notifikasi]
```

Aturan penting: contractor code harus unik, equipment quantity harus `> 0`, dan fuel reference values harus `> 0`.

## 5. Kalkulasi Loading

```mermaid
flowchart TD
    A[User memilih unit dan fuel reference] --> B[Submit /loadings/calculate]
    B --> C[API validasi equipment dan fuel reference]
    C --> D{Data dan activity sesuai?}
    D -- Tidak --> E[Return 422 atau 404]
    D -- Ya --> F[Hitung reference fuel, productivity, dan FR]
    F --> G{Actual liters dan operating hours valid?}
    G -- Ya --> H[Hitung actual L/hr dan actual FR]
    G -- Tidak --> I[Gunakan OEM reference]
    H --> J[Simpan LoadingSummary]
    I --> J
    J --> K[Return LoadingResponse]
```

Batch Loading menerima daftar `rows` dan mengembalikan total fuel, total productivity, dan fuel ratio agregat.

## 6. Kalkulasi Hauling

```mermaid
flowchart TD
    A[User memasukkan unit, fuel type, dan distance] --> B[POST /haulings/calculate]
    B --> C[Validasi equipment dan fuel reference]
    C --> D[Lookup hauling_distance_ref]
    D --> E{Jarak ditemukan?}
    E -- Ya --> F[Gunakan bcm_per_hr reference]
    E -- Tidak --> G[Gunakan equipment productivity atau fallback 110 BCM/hr]
    F --> H[Hitung fuel, productivity, dan FR]
    G --> H
    H --> I[Simpan HaulingSummary]
    I --> J[Return detail hauling]
```

## 7. Kalkulasi Supporting/Dewatering

```mermaid
flowchart TD
    A[User memasukkan unit, fuel reference, PA, UA, EWH, dan production] --> B[POST calculate]
    B --> C[Validasi 0 < PA/UA <= 1 dan production > 0]
    C --> D{Actual liters dan operating hours diberikan?}
    D -- Ya --> E[Gunakan actual liters dan hitung actual L/hr]
    D -- Tidak --> F[Gunakan OEM fuel reference]
    E --> G[Hitung total fuel dan FR]
    F --> G
    G --> H[Simpan summary dengan data_source]
    H --> I[Return detail transaksi]
```

Batch `calculate-all` menjalankan flow untuk seluruh equipment dalam aktivitas terkait.

## 8. Monitoring per aktivitas dan filter

```mermaid
flowchart TD
    A[User memilih activity] --> B[UI meminta fuel-ratio/{activity}]
    B --> C[User mengisi from, to, contractor, atau unit]
    C --> D[Submit query filter]
    D --> E[API validasi aktivitas dan tanggal]
    E --> F[Filter unit berdasarkan contractor/unit]
    F --> G[Ambil trend berdasarkan created_at]
    G --> H[Batasi trend dengan from/to]
    H --> I[Hitung summary dan response]
    I --> J[UI memperbarui unit register, KPI, dan chart]
```

Filter tanggal hanya membatasi trend karena unit register belum memiliki tanggal transaksi individual.

## 9. Contractor performance dan fuzzy risk

```mermaid
flowchart TD
    A[User meminta analisis contractor] --> B[API ambil equipment dan transaksi terbaru]
    B --> C[Hitung productivity, population, dan fuel deviation]
    C --> D[Bangun membership Q25/Q50/Q75 dan fuel fixed sets]
    D --> E[Evaluasi rule Mamdani]
    E --> F[Agregasi MIN/MAX dan centroid]
    F --> G[Map score ke LOW/NORMAL/HIGH]
    G --> H[Return risk score, rule dominan, dan membership]
```

Fuzzy risk adalah sinyal prioritas, bukan keputusan otomatis untuk penalti contractor.

## 10. SPO alignment

### Summary operasional

```mermaid
flowchart TD
    A[User membuka alignment summary] --> B[GET /alignments/summary]
    B --> C[API mengambil overview operasional]
    C --> D[Hitung target fuel, variance, cost impact, dan production gap]
    D --> E[Bangun breakdown aktivitas]
    E --> F[Bangun action items berdasarkan status]
    F --> G[Return alignment response]
```

### Simulasi

```mermaid
flowchart TD
    A[User mengisi actual fuel, production, target FR, target production, fuel price] --> B[UI validasi semua input > 0]
    B --> C[POST /alignments/simulate]
    C --> D[API menghitung FR actual dan target]
    D --> E[Hitung variance dan cost impact]
    E --> F[Generate action items]
    F --> G[Return hasil tanpa mengubah database]
```

## 11. Seed dan maintenance database

```mermaid
flowchart TD
    A[Developer membuat backup database] --> B[Menjalankan python seed.py]
    B --> C[Seeder drop_all dan create_all]
    C --> D[Muat contractor, equipment, fuel reference, dan distance ref]
    D --> E[Buat transaksi/sample summary]
    E --> F[Jalankan test dan cek endpoint]
```

Seeder hanya untuk database demo/local karena bersifat destruktif.

## 12. State dan error yang wajib ditampilkan UI

Setiap flow frontend harus menyediakan:

- loading state saat request berjalan;
- empty state bila array kosong;
- error state untuk `404`, `409`, dan `422`;
- tombol retry untuk error network/server;
- notifikasi sukses setelah mutasi data;
- konfirmasi sebelum delete atau operasi seed.
