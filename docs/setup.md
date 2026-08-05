# Panduan Setup dan Reproduksi FRMS

Dokumen ini menjelaskan cara menjalankan FRMS dari kondisi repository yang baru di-clone, cara memuat data demo, cara memverifikasi service, dan masalah umum saat setup.

## 1. Prasyarat

| Komponen | Versi minimum | Keterangan |
|---|---:|---|
| Git | 2.x | Mengambil source code |
| Python | 3.11 | Menjalankan FastAPI dan test backend |
| Node.js | 20.x | Menjalankan Next.js |
| npm | 10.x | Menginstal dependency frontend |

Perintah berikut digunakan untuk mengecek versi:

```powershell
git --version
python --version
node --version
npm --version
```

## 2. Menyiapkan backend

Dari root repository:

```powershell
cd backend
python -m venv .venv
\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Jika PowerShell menolak aktivasi environment, jalankan perintah berikut hanya untuk terminal aktif:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Memuat data demo

```powershell
python seed.py
```

Seeder membaca file CSV di `backend/data/`, membuat ulang tabel, dan mengisi data contoh. Proses ini bersifat destruktif terhadap `backend/frms.db`, sehingga jangan digunakan pada database operasional tanpa backup.

### Menjalankan API

```powershell
uvicorn main:app --reload --port 8000
```

Biarkan terminal ini tetap berjalan. API dapat diakses melalui `http://127.0.0.1:8000`.

### Verifikasi backend

Buka terminal kedua dan jalankan:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/
```

Dokumentasi endpoint tersedia di:

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/redoc`

Route API menggunakan prefix `/api/v1`, misalnya `GET /api/v1/contractors` dan `POST /api/v1/loadings/calculate`.

## 3. Menyiapkan frontend

Buka terminal baru dari root repository:

```powershell
cd frontend
npm ci
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:8000"
npm run dev
```

Buka `http://localhost:3000` setelah server Next.js aktif.

`npm ci` digunakan agar dependency mengikuti `package-lock.json`. Jika lockfile berubah secara sengaja, gunakan `npm install` lalu commit perubahan lockfile tersebut.

## 4. Konfigurasi backend

Konfigurasi default dapat diganti melalui `backend/.env`:

```env
APP_NAME=Fuel Ratio Monitoring System
APP_VERSION=0.1.0
DEBUG=true
DATABASE_URL=sqlite:///./frms.db
```

Jika `NEXT_PUBLIC_API_URL` tidak diatur, client frontend dapat menggunakan nilai default yang tersedia di kode. Untuk menjalankan backend dan frontend di host atau port berbeda, ubah environment variable tersebut sebelum `npm run dev`.

## 5. Verifikasi kualitas

Jalankan test backend:

```powershell
cd backend
pytest -q
```

Jalankan pemeriksaan frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Setup dianggap berhasil apabila API dapat dibuka, dashboard dapat dimuat, test backend selesai tanpa error, dan build frontend berhasil.

## 6. Troubleshooting

### Port 8000 atau 3000 sudah digunakan

Jalankan service pada port lain:

```powershell
uvicorn main:app --reload --port 8001
npm run dev -- --port 3001
```

Lalu sesuaikan `NEXT_PUBLIC_API_URL` dengan port backend.

### Frontend tidak menampilkan data

Pastikan backend sudah berjalan dan environment variable frontend mengarah ke URL backend:

```powershell
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:8000"
```

Periksa juga endpoint melalui Swagger UI. Beberapa halaman frontend masih placeholder dan beberapa pemanggilan client API masih perlu diselaraskan dengan prefix `/api/v1`.

### Data demo berubah atau hilang

Jalankan `python seed.py` hanya ketika ingin mengembalikan database ke kondisi demo. Seeder membuat ulang tabel dan memuat ulang CSV.

### Dependency Python gagal diinstal

Pastikan Python yang aktif adalah Python 3.11 atau lebih baru dan virtual environment sudah aktif:

```powershell
python --version
Get-Command python
```

### Perubahan kode belum terlihat di browser

Hentikan server, jalankan kembali `npm run dev`, lalu bersihkan cache browser jika diperlukan. Untuk validasi produksi, gunakan `npm run build` dan `npm start`.
