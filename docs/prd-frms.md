# Product Requirements Document (PRD)

## Fuel Ratio Monitoring System (FRMS)

| Item | Nilai |
|---|---|
| Versi dokumen | 1.1 |
| Status | MVP implemented; integrasi frontend–backend masih berjalan |
| Periode data contoh | Operasional 2026 |
| Pemilik produk | Tim Operasional dan Mine Performance |
| Platform | Web desktop |

---

## 1. Latar belakang

PT. X mengoperasikan equipment produksi dan equipment pendukung melalui beberapa kontraktor. Fuel consumption, productivity, dan fuel ratio perlu dibandingkan dengan Standar Parameter Operasi (SPO) agar penyimpangan konsumsi bahan bakar dapat ditemukan lebih cepat.

Proses manual berbasis spreadsheet membuat analisis lintas kontraktor dan aktivitas menjadi lambat, sulit ditelusuri, serta rentan terhadap perbedaan cara perhitungan. FRMS dibangun untuk menyediakan satu sumber informasi operasional yang dapat digunakan untuk memantau Loading, Hauling, Supporting, dan Dewatering.

## 2. Problem statement

Pengguna belum memiliki dashboard dan service API yang konsisten untuk:

- membandingkan fuel ratio aktual dengan target SPO;
- melihat kontribusi equipment dan kontraktor terhadap penyimpangan;
- menghitung konsumsi serta produktivitas berdasarkan data transaksi;
- mengubah hasil analisis menjadi rekomendasi penyelarasan fuel dan produksi.

## 3. Tujuan produk

FRMS harus mampu:

1. Menyajikan ringkasan performa fuel ratio berdasarkan aktivitas dan kontraktor.
2. Menghasilkan perhitungan fuel ratio yang konsisten untuk Loading, Hauling, Supporting, dan Dewatering.
3. Menampilkan selisih aktual terhadap target SPO dalam nilai dan persentase.
4. Memberikan penilaian risiko equipment/kontraktor menggunakan fuzzy Mamdani.
5. Menyediakan analisis alignment yang menghubungkan konsumsi fuel, target produksi, dampak biaya, dan tindakan operasional.
6. Menyediakan API yang dapat digunakan oleh frontend dan integrasi lanjutan.

## 4. Target pengguna

- Operational Engineer — memantau konsumsi dan produktivitas harian.
- Mine Engineer — mengevaluasi pencapaian produksi dan Fuel Ratio.
- Superintendent — menemukan aktivitas atau kontraktor yang memerlukan tindakan.
- Operational Manager — melihat dampak operasional dan biaya pada tingkat ringkasan.
- Management — membaca status alignment, risiko, dan prioritas perbaikan.

## 5. Ruang lingkup

### 5.1 Fitur yang sudah tersedia pada MVP

#### Dashboard multi-kontraktor

Route frontend `/` menampilkan:

- filter contractor;
- total equipment;
- overall fuel ratio;
- total production;
- estimasi konsumsi fuel;
- ranking performa contractor;
- breakdown berdasarkan aktivitas;
- detail contractor dan fleet equipment.

Dashboard mengambil data contractor, equipment, serta summary Loading, Hauling, Supporting, dan Dewatering.

#### Master data dan transaksi API

Backend menyediakan CRUD atau endpoint pembacaan untuk:

- contractor;
- equipment;
- fuel reference;
- hauling distance reference;
- transaksi dan summary Loading;
- transaksi dan summary Hauling;
- transaksi dan summary Supporting;
- transaksi dan summary Dewatering.

#### Monitoring aktivitas

Service monitoring menyediakan ringkasan aktivitas dan detail unit untuk:

- Loading;
- Hauling;
- Supporting;
- Dewatering.

Detail aktivitas mendukung filter tanggal pada trend serta filter contractor dan unit pada register equipment.

#### Fuzzy risk assessment

Engine fuzzy Mamdani menilai risiko berdasarkan kombinasi:

- productivity;
- jumlah/populasi equipment kontraktor;
- rasio fuel aktual terhadap fuel reference.

Output risiko terdiri dari score `0–1`, level `LOW`, `NORMAL`, atau `HIGH`, aturan dominan, dan membership value. Konfigurasi engine memiliki versi dan disimpan di database.

#### SPO alignment

Endpoint alignment menghitung:

- fuel aktual dan fuel target SPO;
- fuel variance dan persentasenya;
- dampak biaya berdasarkan harga fuel;
- production gap;
- produksi yang diperlukan untuk mencapai target fuel ratio;
- status `ALIGNED`, `OVER_BUDGET`, atau `HIGHLY_EFFICIENT`;
- breakdown per aktivitas dan action items berprioritas.

Endpoint simulasi menerima asumsi custom agar pengguna dapat menguji skenario tanpa mengubah data database.

### 5.2 Fitur yang tersedia di backend tetapi belum menjadi halaman frontend penuh

- halaman monitoring per aktivitas;
- halaman SPO/fuel reference management;
- halaman fuel consumption berdasarkan aktivitas;
- halaman contractor performance;
- halaman reports;
- UI untuk alignment dan simulasi.

Route placeholder untuk sebagian halaman tersebut sudah ada di frontend, tetapi belum mengonsumsi endpoint backend secara penuh.

### 5.3 Fitur yang direncanakan

- authentication dan role-based access;
- audit log perubahan data;
- import Excel yang tervalidasi;
- export report PDF/Excel dari data live;
- pagination, sorting, dan advanced filtering;
- notifikasi penyimpangan;
- historical trend yang konsisten lintas aktivitas;
- PostgreSQL dan migration system formal.

## 6. Aturan perhitungan utama

### 6.1 Loading dan Hauling

```text
total_fuel = Σ(quantity × fuel_consumption)
total_productivity = Σ(quantity × productivity)
fuel_ratio = total_fuel / total_productivity
```

### 6.2 Supporting dan Dewatering

```text
EWH = PA × UA × hours_per_year
total_fuel = quantity × EWH × fuel_consumption
fuel_ratio = total_fuel / total_mine_production_bcm
```

Nilai target SPO per aktivitas disimpan pada konfigurasi monitoring. Nilai aktual, target, variance, dan data source harus dapat ditelusuri dari response API.

### 6.3 Alignment

```text
target_fuel = actual_production × target_spo_fuel_ratio
fuel_variance = actual_fuel - target_fuel
cost_impact = fuel_variance × fuel_price_per_liter
```

Interpretasi positif pada fuel variance berarti konsumsi melebihi target.

## 7. Requirement fungsional

### FR-01 — Dashboard contractor

Sistem harus menampilkan daftar contractor, fleet equipment, summary aktivitas, ranking fuel ratio, dan filter contractor. Perubahan contractor harus memperbarui metric, chart, dan tabel yang terlihat.

### FR-02 — Monitoring aktivitas

Sistem harus mengembalikan `ActivityResponse` yang berisi `units`, `trend`, `summary`, dan `contractors` untuk aktivitas yang valid.

Query filter yang didukung:

| Filter | Perilaku |
|---|---|
| `from` | membatasi tanggal awal trend |
| `to` | membatasi tanggal akhir trend |
| `contractor` | pencarian nama contractor secara case-insensitive |
| `unit` | pencarian pada unit type atau category secara case-insensitive |

Filter tanggal hanya membatasi trend karena record unit belum memiliki tanggal transaksi individual. Filter contractor dan unit memengaruhi unit register dan summary.

### FR-03 — Monitoring overview

Sistem harus menyediakan ringkasan seluruh aktivitas melalui endpoint overview. Pada implementasi saat ini endpoint overview belum menerima query filter; dukungan filter overview menjadi item integrasi berikutnya.

### FR-04 — Calculation

Sistem harus memvalidasi quantity, fuel consumption, productivity, PA, UA, EWH, dan total production sesuai jenis aktivitas sebelum menyimpan atau mengembalikan hasil kalkulasi.

### FR-05 — Contractor performance dan fuzzy risk

Sistem harus dapat mengevaluasi performa contractor dan mengembalikan risiko fuzzy per contractor maupun per unit berdasarkan konfigurasi versi aktif.

### FR-06 — SPO alignment

Sistem harus menyediakan analisis berbasis data operasional dan simulasi berbasis input custom tanpa mengubah data operasional.

### FR-07 — Response API

Endpoint yang memakai `APIResponse` harus mengembalikan `success`, `code`, `message`, `data`, dan `meta`. Error validasi harus mengembalikan status HTTP yang sesuai dan pesan yang dapat ditindaklanjuti.

## 8. Requirement non-fungsional

### NFR-01 — Usability

- Dashboard utama dapat dipahami tanpa membaca dokumentasi teknis.
- Metric menampilkan satuan yang jelas: Liter, L/BCM, BCM, jam, atau IDR.
- Status risiko dan alignment menggunakan label yang konsisten.

### NFR-02 — Performance

- Endpoint read-only harus merespons normal dalam waktu yang sesuai untuk database MVP.
- Perhitungan batch tidak boleh melakukan query berulang yang tidak diperlukan.
- Frontend menampilkan loading dan error state ketika data belum tersedia.

### NFR-03 — Reliability

- Perhitungan harus deterministik untuk input yang sama.
- Seed database harus dapat dijalankan ulang pada lingkungan demo.
- Perubahan schema runtime tidak boleh menghapus data secara otomatis.

### NFR-04 — Security

- Authentication dan authorization wajib ditambahkan sebelum deployment production.
- CORS tidak boleh tetap terbuka untuk semua origin pada deployment production.
- Endpoint mutasi harus memiliki audit trail pada fase berikutnya.

### NFR-05 — Compatibility

- Browser utama: Chrome dan Microsoft Edge versi modern.
- Prioritas layout: desktop; tablet menjadi prioritas berikutnya.
- API menggunakan JSON dan tanggal ISO `YYYY-MM-DD`.

## 9. Struktur navigasi target

```text
Dashboard
├── Contractor Monitoring              (aktif pada /)
├── Fuel Ratio Monitoring
│   ├── Loading                         (backend tersedia, UI lanjutan)
│   ├── Hauling                         (backend tersedia, UI lanjutan)
│   ├── Supporting                      (backend tersedia, UI lanjutan)
│   └── Dewatering                      (backend tersedia, UI lanjutan)
├── SPO / Fuel Reference                (backend tersedia, UI lanjutan)
├── Contractor Performance              (backend tersedia, UI lanjutan)
├── Alignment & Simulation              (backend tersedia, UI lanjutan)
└── Reports                             (direncanakan)
```

## 10. Kriteria penerimaan MVP

MVP dianggap memenuhi requirement apabila:

1. Backend dapat dijalankan dengan `uvicorn main:app --reload --port 8000`.
2. Database dapat di-seed dari CSV demo.
3. Dashboard root dapat menampilkan data contractor, equipment, dan activity summary.
4. Filter contractor pada dashboard memperbarui data yang terlihat.
5. Endpoint monitoring menerima aktivitas valid dan menghasilkan schema yang terdokumentasi.
6. Endpoint fuzzy risk menghasilkan score dan level risiko yang valid.
7. Endpoint alignment menghasilkan variance fuel, dampak biaya, status, dan action items.
8. Test backend dan build frontend dapat dijalankan tanpa error blocking.

## 11. Batasan dan risiko saat ini

- Client frontend masih menggunakan beberapa path API legacy yang belum memakai prefix `/api/v1`.
- Sebagian endpoint summary belum memakai response envelope yang seragam.
- Halaman monitoring dan analysis belum seluruhnya terhubung ke API.
- Database default masih SQLite dan belum memiliki Alembic migration.
- Data trend bergantung pada tanggal transaksi yang tersedia; sistem tidak membuat titik synthetic.
- Seeder menghapus dan membuat ulang tabel database demo.
- Belum ada authentication, authorization, audit log, atau rate limiting.

## 12. Roadmap

### Phase 1 — MVP saat ini

- database dan seed data;
- API CRUD master data;
- calculation engine empat aktivitas;
- monitoring service;
- contractor dashboard;
- fuzzy Mamdani risk assessment;
- SPO alignment dan simulation endpoint.

### Phase 2 — Integrasi aplikasi

- selaraskan client API dengan `/api/v1` dan response envelope;
- selesaikan halaman monitoring per aktivitas;
- tambahkan filter overview yang benar-benar memengaruhi response;
- tambahkan UI SPO, alignment, dan contractor performance;
- tambahkan test integrasi frontend–backend.

### Phase 3 — Production readiness

- authentication, role management, dan audit log;
- PostgreSQL dan Alembic migration;
- export report dari data live;
- observability, backup, dan hardening CORS.

### Phase 4 — Advanced analytics

- historical forecasting;
- anomaly detection;
- notification workflow;
- integrasi IoT dan near-real-time monitoring;
- mobile companion application.

## 13. Technology stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- lucide-react

### Backend

- FastAPI
- SQLAlchemy
- Pydantic dan pydantic-settings
- SQLite untuk MVP
- pytest dan httpx

### Analytics

- Fuzzy Mamdani
- Membership function dan rule base terversi
- Calculation engine berbasis aktivitas
