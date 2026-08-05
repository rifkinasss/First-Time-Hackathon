"""Data demo historis untuk memperlihatkan grafik tren pada lingkungan lokal."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.loading import Loading
from app.services.loading_service import _run_calculation_engine


def seed_loading_trend_history(db: Session, hours: int = 12) -> int:
    """Tambahkan satu transaksi Loading aktual per jam tanpa menghapus data.

    Seeder dilewati jika sudah terdapat sedikitnya ``hours`` transaksi historis
    dalam 13 jam terakhir. Data ini hanya untuk visualisasi demo lokal.
    """
    now = datetime.now().replace(second=0, microsecond=0)
    history_start = now - timedelta(hours=13)
    history_end = now - timedelta(minutes=5)
    existing_history = (
        db.query(Loading.created_at)
        .filter(Loading.created_at >= history_start, Loading.created_at <= history_end)
        .all()
    )
    existing_points = {
        recorded_at.strftime("%Y-%m-%dT%H:%M")
        for (recorded_at,) in existing_history
        if recorded_at is not None
    }
    if len(existing_points) >= hours:
        return 0

    sources = (
        db.query(Loading)
        .filter(Loading.summary.has())
        .order_by(Loading.id)
        .all()
    )
    if not sources:
        raise ValueError("Seeder tren membutuhkan minimal satu transaksi Loading beserta ringkasannya.")

    variation = [0.94, 0.97, 1.01, 0.98, 1.04, 1.00, 0.96, 1.03, 0.99, 1.02, 0.97, 1.00]
    for index in range(hours):
        source = sources[index % len(sources)]
        recorded_at = now - timedelta(hours=hours - index)
        operating_hours = 1.0
        fuel_per_hour = source.equipment.qty * source.fuel_reference.average * variation[index % len(variation)]
        historical_loading = Loading(
            equipment_id=source.equipment_id,
            fuel_reference_id=source.fuel_reference_id,
            fuel_consumed_liters=round(fuel_per_hour * operating_hours, 2),
            operating_hours=operating_hours,
            created_at=recorded_at,
        )
        historical_loading.equipment = source.equipment
        historical_loading.fuel_reference = source.fuel_reference
        db.add(historical_loading)
        db.flush()
        _run_calculation_engine(db, historical_loading)
        historical_loading.summary.created_at = recorded_at

    db.commit()
    return hours
