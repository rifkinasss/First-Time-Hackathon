# Documentation: Fuzzy Logic Evaluation System for Fuel Ratio Monitoring

Dokumentasi ini menjelaskan alasan teknis, arsitektur domain, justifikasi matematis, dan **argumen pertahanan (*executive Q&A defense*)** di balik perancangan **Fuzzy Logic Inference System (Mamdani Model)** untuk penilaian **Fuel Ratio (FR)** unit operasional tambang.

---

## 📌 1. Mengapa Menggunakan Fuzzy Logic?

Pada manajemen operasional tambang, perhitungan konsumsi bahan bakar (*Fuel Ratio* = $L/BCM$) tidak bisa hanya mengandalkan nilai *hard threshold* (potongan kaku). Sebagai contoh:
- Jika batas produktivitas efisien ditetapkan $> 800\text{ BCM/HR}$, maka unit dengan produktivitas $799\text{ BCM/HR}$ akan langsung dianggap "inefisien", padahal perbedaannya hanya $1\text{ BCM/HR}$.
- Kinerja unit dipengaruhi oleh 3 dimensi yang saling berinteraksi: **Performa Kontraktor**, **Kepadatan Infrastruktur Pit**, dan **Kondisi/Usia Mesin Alat**.

**Fuzzy Logic** memodelkan kontinum derajat keanggotaan ($\mu \in [0, 1]$) dan aturan linguistik manusia untuk memberikan evaluasi yang mulus (*smooth*), adaptif, dan realistis.

---

## 🎯 2. Argumen Terkuat & Defense Justifikasi Data (*Executive Q&A Defense*)

Jika ditanya mengenai karakteristik data operasional dan cara penentuan threshold, berikut adalah 3 argumen terkuat:

### 1️⃣ Heterogenitas Armada Tambang & Penanganan Ketimpangan Kelas Excavator
> *"Data operasional tambang terlihat sangat timpang (skewed) secara global karena armada kita **heterogen**. Di database `frms.db`, Excavator terbagi dalam berbagai kelas tonnage:*
> - **Kelas Kecil/Sedang (PC200, PC300, PC400)**: Digunakan untuk Coal, Mud, dan Support.
> - **Kelas Menengah (PC1250)**: Produktivitas $310 - 320\text{ BCM/jam}$, konsumsi $80 - 120\text{ L/jam}$.
> - **Kelas Super Heavy (PC2000, EX2600, PC3400)**: Produktivitas $800 - 1.160\text{ BCM/jam}$, konsumsi $150 - 250\text{ L/jam}$.
> 
> *Jika PC1250 dibandingkan secara mentah dengan PC3400, tentu terjadi ketimpangan. Solusinya:*
> 1. **Penggunaan Indikator Netral (Fuel Ratio = $L/BCM$)**: Mengukur konsumsi bahan bakar per 1 BCM material yang dipindahkan. Unit kecil dan besar diukur dalam gelanggang efisiensi rasio yang adil.
> 2. **Normalisasi Berbasis Kelas Unit (*Class-Based Baseline*)**: Parameter keanggotaan disesuaikan dengan acuan OEM spesifik per tipe unit dari tabel `fuel_reference`."*

### 2️⃣ Mencegah *Cliff Effect* (Paradoks Batas Kaku)
> *"Kondisi lapangan tidak mengenal angka hitam-putih. Jika kita pakai IF-ELSE tradisional dengan batas kaku ($> 800\text{ BCM/jam}$ = Bagus), maka unit $799\text{ BCM/jam}$ secara tidak adil dicap 'Boros', padahal selisihnya hanya $1\text{ BCM}$. **Fuzzy Logic menyelesaikan masalah ini** dengan derajat keanggotaan $[0, 1]$, sehingga transisi dari efisien ke boros berjalan mulus (*smooth & continuous*) sesuai dinamika lapangan."*

### 3️⃣ Kombinasi *Dual Source of Truth* (OEM Ref + Statistik $P_{25}, P_{50}, P_{75}$)
> *"Threshold keanggotaan kami tidak ditebak secara intuitif, melainkan menggabungkan **Dua Sumber Kebenaran (Dual Source of Truth)**:*
> 1. **Standar Spesifikasi Pabrik (OEM Reference)** di tabel `fuel_reference`: Batas konsumsi solar mesin ($L/HR$) kondisi *low*, *average*, dan *high*.
> 2. **Statistik Kuartil Data Asli ($P_{25}, P_{50}, P_{75}$)**: Batas produktivitas riil kontraktor dan titik jenuh populasi armada ($Qty$) di pit agar tidak terjadi kemacetan antrean (*queueing bottleneck*)."*

---

## 🏗️ 3. Penanganan Ketimpangan Kelas Excavator (Class-Based Normalization)

Di database `frms.db`, armada Excavator dibagi berdasarkan **Peruntukan Aktivitas** dan **Kelas Tonnage**:

| Kelas Unit | Contoh Tipe Unit | Peruntukan Aktivitas | Range Produktivitas ($BCM/HR$) | Range Cons ($L/HR$) | Pendekatan Evaluasi Fuzzy |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Super Heavy Excavator** | `PC3400`, `EX2600`, `PC2000` | Overburden (OB) Loading Utama | $800 - 1.160\text{ BCM/HR}$ | $150 - 250\text{ L/HR}$ | Dievaluasi berdasarkan $L/BCM$ & Ref Fuel High-Load OEM |
| **Heavy Excavator** | `PC1250` | Overburden (OB) Loading | $310 - 320\text{ BCM/HR}$ | $80 - 120\text{ L/HR}$ | Dievaluasi berdasarkan $L/BCM$ & Ref Fuel Mid-Load OEM |
| **Medium / Support Excavator** | `PC200`, `PC300`, `PC400`, `PC800` | Coal, Mud & Support Pit | $0\text{ (batu bara/lumpur)}$ | $20 - 50\text{ L/HR}$ | Dievaluasi berbasis $L/HR$ Ref Fuel OEM (tanpa penalti BCM) |

---

## 🛠️ 4. Dokumentasi Per Fitur & Alasan Perancangannya

---

### Fitur 1: Penilaian Kinerja Kontraktor (`Productivity` / BCM/HR)

#### 🎯 Alasan Menggunakan Fitur Ini:
Produktivitas menggambarkan kemampuan operasional kontraktor dalam memindahkan material galian (*Overburden / Coal*) per jam. Kontraktor dengan operator berpengalaman dan pola pemuatan efisien akan menghasilkan BCM/HR yang tinggi, sehingga rasio konsumsi solar per BCM yang dihasilkan menjadi lebih hemat.

#### 📐 Penentuan Threshold & Keanggotaan:
Berdasarkan data kuartil empiris dari database `frms.db` (`equipment` table):
- **Min ($P_{\text{min}}$)**: $310\text{ BCM/HR}$
- **Lower Quartile ($P_{25}$)**: $400\text{ BCM/HR}$ $\rightarrow$ Batas bawah kategori `NORMAL`
- **Median ($P_{50}$)**: $820\text{ BCM/HR}$ $\rightarrow$ Puncak tertinggi kategori `NORMAL`
- **Upper Quartile ($P_{75}$)**: $930\text{ BCM/HR}$ $\rightarrow$ Batas awal kategori `UP (Tinggi)`
- **Max ($P_{\text{max}}$)**: $1160\text{ BCM/HR}$

#### 📜 Aturan Domain (Rule 1):
$$\text{\textbf{IF Productivity is UP (Tinggi) THEN Fuel Ratio is DOWN (Efisien)}}$$

---

### Fitur 2: Penilaian Kepadatan & Kemacetan Pit (`Population` / Qty Unit)

#### 🎯 Alasan Menggunakan Fitur Ini:
Penambahan populasi unit di satu sektor area tambang tidak selalu meningkatkan produksi. Ketika populasi unit di pit terlalu padat ($> 15\text{ unit}$), terjadi penumpukan truk (*queueing*), antrean di *front loading*, dan kemacetan jalur angkut (*hauling bottleneck*). Unit tetap membakar solar saat *idle* (mesin menyala saat mengantre), yang mengakibatkan Fuel Ratio melonjak naik.

#### 📐 Penentuan Threshold & Keanggotaan:
Berdasarkan data populasi armada di `frms.db`:
- **Min ($POP_{\text{min}}$)**: $1\text{ Unit}$
- **Lower Quartile ($POP_{25}$)**: $3\text{ Units}$ $\rightarrow$ Kategori `DOWN (Sangat Lancar)`
- **Median ($POP_{50}$)**: $6\text{ Units}$ $\rightarrow$ Puncak kondisi populasi `NORMAL`
- **Upper Quartile ($POP_{75}$)**: $15.5\text{ Units}$ $\rightarrow$ Mulai terjadi potensi kemacetan (`UP`)
- **Max ($POP_{\text{max}}$)**: $61\text{ Units}$

#### 📜 Aturan Domain (Rule 2):
$$\text{\textbf{IF Population is UP (Tinggi/Padat) THEN Fuel Ratio is UP (Boros/Tinggi)}}$$

---

### Fitur 3: Penilaian Kesehatan & Usia Alat (`Fuel Consumption` / L/HR)

#### 🎯 Alasan Menggunakan Fitur Ini:
Laju konsumsi bahan bakar per jam ($L/HR$) adalah indikator langsung dari kondisi fisik mesin. Alat yang sudah tua, mengalami keausan injektor, atau kebocoran sistem hidrolik akan mengonsumsi solar jauh di atas standar pabrik meskipun beban kerjanya sama.

#### 📐 Penentuan Threshold & Keanggotaan:
Menggunakan **Acuan Standar Pabrik (OEM Reference)** pada tabel `fuel_reference`:
- **OEM Low Threshold ($FC_{\text{low}}$)**: $14.0\text{ L/HR}$ $\rightarrow$ Kategori `DOWN (Sangat Hemat)`
- **OEM Average Threshold ($FC_{\text{avg}}$)**: $20.0\text{ L/HR}$ $\rightarrow$ Puncak kondisi `NORMAL`
- **OEM High Threshold ($FC_{\text{high}}$)**: $24.0\text{ L/HR}$ $\rightarrow$ Mulai kategori `UP (Konsumsi Tinggi)`
- **Max Empiris ($FC_{\text{max}}$)**: $291.0\text{ L/HR}$ (Untuk Excavator Raksasa)

#### 📜 Aturan Domain (Rule 3):
$$\text{\textbf{IF Fuel Consumption is UP (Tinggi/Alat Tua) THEN Fuel Ratio is UP (Boros/Tinggi)}}$$

---

### Fitur 4: Inferensi Multi-Driver & Output Fuel Ratio ($L/BCM$)

#### 🎯 Alasan Menggunakan Fitur Ini:
Menggabungkan 3 dimensi bisnis (Kinerja Kontraktor, Kemacetan Infra Pit, dan Kesehatan Alat) ke dalam satu skor luaran tunggal $L/BCM$ secara holistik.

#### ⚙️ Mesin Inferensi Mamdani:
1. **Fuzifikasi**: Memetakan nilai masukan riil ke derajat keanggotaan $\mu(x) \in [0, 1]$.
2. **Evaluasi Aturan**: Menggunakan operator **MIN** untuk kombinasi `AND`.
3. **Agregasi**: Menggabungkan luaran seluruh aturan dengan operator **MAX**.
4. **Defuzifikasi Centroid (Center of Gravity)**:
   $$y^* = \frac{\int y \cdot \mu_{\text{out}}(y) \, dy}{\int \mu_{\text{out}}(y) \, dy}$$

#### 📊 Klasifikasi Evaluasi Kinerja:
- $\text{FR} \le 0.35\text{ L/BCM} \rightarrow$ **`Efisien (DOWN)`** (Kinerja Sangat Baik)
- $0.35 < \text{FR} \le 0.65\text{ L/BCM} \rightarrow$ **`Standard (NORMAL)`** (Kinerja Normal)
- $\text{FR} > 0.65\text{ L/BCM} \rightarrow$ **`Boros (UP)`** (Perlu Tindakan Evaluasi / Maintenance)

---

### Fitur 5: Standardisasi Min-Max Normalization ($[0.0, 1.0]$)

#### 🎯 Alasan Menggunakan Fitur Ini:
Unit operasional di tambang sangat heterogen (Excavator OB vs Dump Truck vs Pompa Dewatering). Min-Max scaling memetakan seluruh variabel dari skala fisiknya ke domain terstandar $[0.0, 1.0]$:

$$x_{\text{norm}} = \frac{x_{\text{raw}} - x_{\text{min}}}{x_{\text{max}} - x_{\text{min}}}$$

Hal ini memastikan grafik fungsi keanggotaan dapat dibandingkan secara adil dan konsisten tanpa terdistorsi oleh perbedaan satuan fisik ($BCM/HR$ vs $Unit$ vs $L/HR$).

---

## 📊 5. Ringkasan Matriks Aturan Fuzzy (Mamdani Rule Base)

| No | Productivity (Kontraktor) | Population (Infrastruktur) | Fuel Cons (Kondisi Alat) | Output Fuel Ratio | Interpretasi Bisnis Tambang |
| :-: | :---: | :---: | :---: | :---: | :--- |
| **1** | **UP (Tinggi)** | - | - | **DOWN (Efisien)** | Kontraktor efisien menekan Fuel Ratio |
| **2** | - | **UP (Padat)** | - | **UP (Boros)** | Kemacetan pit mendorong Fuel Ratio naik |
| **3** | - | - | **UP (Tinggi)** | **UP (Boros)** | Mesin aus/tua memboroskan solar |
| **4** | **DOWN (Rendah)** | **UP (Padat)** | **UP (Tinggi)** | **UP (Boros)** | Kondisi terburuk: Prod rendah + macet + alat tua |
| **5** | **UP (Tinggi)** | **DOWN (Lancar)** | **DOWN (Hemat)** | **DOWN (Efisien)** | Kondisi optimal: Prod tinggi + pit sepi + alat sehat |
| **6** | **NORMAL** | **NORMAL** | **NORMAL** | **NORMAL** | Operasi standar harian tambang |

---

## 💡 6. Quick Reference Q&A Defense

| Pertanyaan Penguji / Juri | Kunci Jawaban Pertahanan Anda |
| :--- | :--- |
| **"Apakah ada ketimpangan antar kelas Excavator?"** | *"Ada perbedaan fisik, namun disetarakan oleh dua hal: (1) Menggunakan **Fuel Ratio ($L/BCM$)** sebagai metrik netral, dan (2) **Class-Based Baseline** berbasis acuan OEM per tipe unit."* |
| **"Kenapa datanya berantakan?"** | *"Heterogenitas jenis unit tambang (Excavator vs Pompa) & distribusi skewness alami operasional."* |
| **"Kenapa pakai Fuzzy, bukan IF-ELSE biasa?"** | *"Mencegah Cliff Effect pada nilai perbatasan & memodelkan interaksi 3 variabel bisnis sekaligus."* |
| **"Dari mana angka threshold-nya?"** | *"Kombinasi Acuan OEM Pabrik (`fuel_reference`) & Kuartil Empiris Data Operasional ($P_{25}, P_{50}, P_{75}$)."* |
