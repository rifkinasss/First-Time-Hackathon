from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # hanya untuk SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_runtime_schema() -> None:
    """Add non-destructive columns for existing SQLite databases.

    This keeps the demo database compatible until a formal Alembic migration is
    introduced. Existing rows remain valid and use OEM_REFERENCE by default.
    """
    additions = {
        "supporting": {
            "fuel_consumed_liters": "FLOAT",
            "operating_hours": "FLOAT",
            "data_source": "VARCHAR(40) NOT NULL DEFAULT 'OEM_REFERENCE'",
        },
        "supporting_summary": {
            "fuel_cons_reference": "FLOAT",
            "fuel_cons_actual": "FLOAT",
            "fuel_ratio_reference": "FLOAT",
            "fuel_ratio_actual": "FLOAT",
            "data_source": "VARCHAR(40) NOT NULL DEFAULT 'OEM_REFERENCE'",
        },
        "dewatering": {
            "fuel_consumed_liters": "FLOAT",
            "operating_hours": "FLOAT",
            "data_source": "VARCHAR(40) NOT NULL DEFAULT 'OEM_REFERENCE'",
        },
        "dewatering_summary": {
            "fuel_cons_reference": "FLOAT",
            "fuel_cons_actual": "FLOAT",
            "fuel_ratio_reference": "FLOAT",
            "fuel_ratio_actual": "FLOAT",
            "data_source": "VARCHAR(40) NOT NULL DEFAULT 'OEM_REFERENCE'",
        },
    }
    inspector = inspect(engine)
    with engine.begin() as connection:
        for table, columns in additions.items():
            if not inspector.has_table(table):
                continue
            existing = {column["name"] for column in inspect(connection).get_columns(table)}
            for column, definition in columns.items():
                if column not in existing:
                    connection.execute(text(f'ALTER TABLE "{table}" ADD COLUMN "{column}" {definition}'))


def get_db():
    """Dependency injection untuk database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
