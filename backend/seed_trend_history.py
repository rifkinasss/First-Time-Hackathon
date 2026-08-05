"""Tambahkan data tren historis ke database lokal tanpa menghapus data lain.

Jalankan dari folder backend:
    python3 seed_trend_history.py
"""

from app.database import SessionLocal
from app.services.demo_trend_seed import seed_loading_trend_history


def main() -> None:
    db = SessionLocal()
    try:
        created = seed_loading_trend_history(db, hours=12)
        if created:
            print(f"✅ Ditambahkan {created} titik transaksi historis untuk tren 12 jam terakhir.")
        else:
            print("ℹ️ Riwayat tren 12 jam sudah tersedia; tidak ada data duplikat yang ditambahkan.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
