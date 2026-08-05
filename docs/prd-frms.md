# Product Requirements Document (PRD)

**Project Name**  
Fuel Ratio Monitoring System (FRMS)

**Version**  
1.0

**Status**  
Draft

**Phase**  
MVP - Phase 1 (Frontend)

---

# 1. Project Overview

## Background

PT. X memiliki beberapa kontraktor yang mengoperasikan alat produksi maupun alat pendukung dalam kegiatan operasional pertambangan. Berdasarkan hasil evaluasi operasional tahun 2026, forecast Fuel Ratio perusahaan melebihi target tahunan sebesar ±17%.

Kondisi tersebut berpotensi meningkatkan biaya operasional serta memunculkan klaim kelebihan konsumsi bahan bakar dari kontraktor.

Hasil analisis awal menunjukkan beberapa penyebab utama, antara lain:

- Produktivitas alat produksi (Loading dan Hauling) masih berada di bawah target.
- Jumlah Support Equipment melebihi kebutuhan operasional.
- Penggunaan Dewatering Equipment meningkatkan konsumsi fuel.
- Monitoring Fuel Ratio masih dilakukan secara manual menggunakan spreadsheet.
- Belum tersedia dashboard yang mampu membandingkan data aktual terhadap Standar Parameter Operational (SPO).

---

## Problem Statement

Belum terdapat sistem monitoring yang mampu mengintegrasikan data Fuel Consumption, Productivity, dan Standar Parameter Operational (SPO) sehingga perusahaan kesulitan melakukan monitoring Fuel Ratio secara cepat, akurat, dan terintegrasi.

---

## Objectives

Membangun aplikasi monitoring Fuel Ratio yang mampu:

- Menampilkan kondisi Fuel Ratio secara real-time atau periodik.
- Membandingkan Fuel Ratio aktual dengan standar SPO.
- Mengidentifikasi penyimpangan Fuel Ratio berdasarkan aktivitas operasional.
- Menyediakan dashboard analisis untuk mendukung pengambilan keputusan.

---

# 2. Project Scope

## In Scope

### Dashboard

- Executive Dashboard
- Fuel Ratio Summary
- Fuel Consumption Summary
- Productivity Summary
- Variance Summary

### Fuel Ratio Monitoring

- Loading
- Hauling
- Supporting
- Dewatering

### SPO Management

- Monitoring data SPO
- Import SPO
- Update SPO

### Master Data

- Activity
- Unit Type
- Contractor
- Equipment

### Reporting

- Export Excel
- Export PDF

---

## Out of Scope

Phase pertama belum mencakup:

- Login & Authentication
- Role Management
- AI Recommendation
- Forecasting
- Mobile Application
- IoT Integration
- Automatic Data Synchronization

---

# 3. Target Users

- Operational Engineer
- Mine Engineer
- Superintendent
- Manager Operational
- Management

---

# 4. Business Goals

Sistem diharapkan mampu:

- Mengurangi waktu analisis Fuel Ratio.
- Mempermudah identifikasi penyebab tingginya Fuel Ratio.
- Membantu evaluasi performa kontraktor.
- Membantu evaluasi efisiensi alat.
- Menjadi sumber informasi operasional berbasis data.

---

# 5. Dashboard Modules

## 5.1 Executive Dashboard

Menampilkan ringkasan seluruh operasional.

### KPI

- Total Fuel Consumption
- Total Production
- Average Fuel Ratio
- Total Contractor
- Total Equipment
- Average Productivity

### Charts

- Fuel Consumption Trend
- Production Trend
- Fuel Ratio Trend

### Summary

- Activity Performance
- Contractor Performance
- Fuel Ratio Distribution

---

## 5.2 Fuel Ratio Monitoring

Merupakan modul utama sistem.

Terdiri dari empat aktivitas operasional.

### Loading

Monitoring Fuel Ratio aktivitas Loading.

Informasi yang ditampilkan:

- Fuel Consumption
- Productivity
- Fuel Ratio
- Target SPO
- Variance
- Trend

---

### Hauling

Monitoring Fuel Ratio aktivitas Hauling.

Informasi yang ditampilkan:

- Fuel Consumption
- Productivity
- Fuel Ratio
- Target SPO
- Variance
- Trend

---

### Supporting

Monitoring Fuel Ratio Support Equipment.

Informasi yang ditampilkan:

- PA
- UA
- EWH
- Fuel Consumption
- Fuel Ratio
- Variance

---

### Dewatering

Monitoring Fuel Ratio Dewatering Equipment.

Informasi yang ditampilkan:

- PA
- UA
- EWH
- Fuel Consumption
- Fuel Ratio
- Variance

---

## 5.3 SPO Management

Digunakan untuk mengelola Standar Parameter Operational.

Data yang dikelola:

- Activity
- Unit Type
- Quantity
- Fuel Consumption
- Productivity
- Fuel Ratio
- PA
- UA
- EWH

Fitur:

- View SPO
- Add SPO
- Edit SPO
- Delete SPO
- Import Excel

---

## 5.4 Master Data

Data referensi yang digunakan sistem.

Master Data meliputi:

- Activity
- Unit Type
- Contractor
- Equipment
- Equipment Category

---

## 5.5 Reporting

Laporan Fuel Ratio.

Jenis laporan:

- Daily
- Weekly
- Monthly

Output:

- PDF
- Excel

---

# 6. Navigation Structure

```
Dashboard
│
├── Overview
│
├── Fuel Ratio Monitoring
│   ├── Loading
│   ├── Hauling
│   ├── Supporting
│   └── Dewatering
│
├── SPO Management
│
├── Master Data
│
└── Reports
```

---

# 7. Dashboard Layout

```
--------------------------------------------------------

Sidebar

--------------------------------------------------------

Top Navigation

--------------------------------------------------------

KPI Cards

--------------------------------------------------------

Fuel Ratio Trend

--------------------------------------------------------

Fuel Consumption Trend

--------------------------------------------------------

Activity Summary

--------------------------------------------------------

Fuel Ratio Monitoring

--------------------------------------------------------

Recent Alert

--------------------------------------------------------
```

---

# 8. Functional Requirements

## Dashboard

- View KPI
- View Fuel Trend
- View Production Trend
- View Fuel Ratio Trend
- View Activity Summary

---

## Fuel Ratio Monitoring

User dapat:

- Melihat Fuel Ratio berdasarkan aktivitas.
- Memfilter data berdasarkan periode.
- Memfilter berdasarkan contractor.
- Memfilter berdasarkan unit.
- Melihat detail Fuel Ratio.
- Melihat variance terhadap SPO.

---

## SPO Management

User dapat:

- Menambah data SPO.
- Mengubah data SPO.
- Menghapus data SPO.
- Mengimpor data SPO melalui Excel.

---

## Master Data

User dapat mengelola:

- Activity
- Unit Type
- Contractor
- Equipment

---

## Reporting

User dapat:

- Export PDF
- Export Excel

---

# 9. Non Functional Requirements

## Performance

- Loading halaman < 3 detik.
- Mendukung data dalam jumlah besar.

## Compatibility

- Chrome
- Microsoft Edge

## Responsive

Prioritas:

- Desktop

Opsional:

- Tablet

---

# 10. MVP Deliverables

Pada fase pertama, aplikasi akan menghasilkan:

- Dashboard
- Fuel Ratio Monitoring
- SPO Management
- Master Data
- Reporting

Seluruh data masih dapat menggunakan dummy data atau static JSON sebelum backend selesai dikembangkan.

---

# 11. Future Roadmap

## Phase 2

- Authentication
- Role Permission
- Backend API Integration
- PostgreSQL Integration

## Phase 3

- Forecast Fuel Ratio
- AI Recommendation
- Anomaly Detection
- Notification System

## Phase 4

- IoT Integration
- Real-time Dashboard
- Mobile Application

---

# 12. Technology Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Table
- React Hook Form
- Zod
- Recharts / Apache ECharts
- Zustand

## Backend (Next Phase)

- Laravel
- PostgreSQL
- Redis

---

# 13. Notes

Phase pertama difokuskan pada implementasi antarmuka (Frontend) menggunakan data dummy yang merepresentasikan kondisi operasional sebenarnya. Seluruh struktur halaman, komponen, navigasi, dan alur pengguna akan disiapkan agar backend dapat diintegrasikan tanpa perubahan besar pada sisi frontend.