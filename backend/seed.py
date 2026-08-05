"""
Seeder — membaca data dari folder data/:
  - data/Contractor - Sheet1.csv
  - data/Equipment - Sheet1.csv
  - data/Ref Fuel - Sheet1.csv
  - data/Hauling Distance Ref - Sheet1.csv

Run dari folder backend:
    python3 seed.py
"""

import sys
import os
import csv
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.contractor import Contractor
from app.models.equipment import Equipment
from app.models.fuel_reference import FuelReference
from app.models.hauling_distance_ref import HaulingDistanceRef
from app.models.hauling import Hauling, HaulingSummary
from app.models.supporting import Supporting, SupportingSummary
from app.models.dewatering import Dewatering, DewateringSummary
from app.services.demo_trend_seed import seed_loading_trend_history
import app.models  # noqa: trigger all model registration

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(base_dir, 'data')

        # 1. Seed Contractors
        contractor_csv = os.path.join(data_dir, 'Contractor - Sheet1.csv')
        contractor_ids = []
        contractor_map = {}
        if os.path.exists(contractor_csv):
            with open(contractor_csv, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    c = Contractor(
                        code=row['code'].strip(),
                        company_name=row['company_name'].strip(),
                        status=row.get('status', 'active').strip()
                    )
                    db.add(c)
                    db.flush()
                    contractor_map[c.code] = c.id
                    contractor_ids.append(c.id)
            print(f'✅ Loaded {len(contractor_ids)} Contractors')
        else:
            for i in range(10):
                code = f'PT{chr(65+i)}'
                name = f'PT. {chr(65+i)}'
                c = Contractor(code=code, company_name=name, status='active')
                db.add(c)
                db.flush()
                contractor_map[code] = c.id
                contractor_ids.append(c.id)
            print('✅ Created 10 fallback Contractors (PT. A - PT. J)')

        db.commit()
        num_contractors = len(contractor_ids)

        # 2. Seed Equipment
        equipment_csv = os.path.join(data_dir, 'Equipment - Sheet1.csv')
        eq_objs = []
        if os.path.exists(equipment_csv):
            with open(equipment_csv, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader):
                    c_code = row.get('contractor_code', '').strip()
                    target_cid = contractor_map[c_code] if c_code in contractor_map else contractor_ids[idx % num_contractors]

                    unit_type = row.get('Unit type list', row.get('unit_type', '')).strip()
                    item = row.get('Item', row.get('item', '')).strip()
                    activity = row.get('Activity', row.get('activity', '')).strip()
                    qty = int(row.get('Qty (unit)', '1').strip() or 1)
                    p_str = row.get('Productivity (bcm/hr)', '0').strip().replace(',', '.')
                    productivity = float(p_str) if p_str and not p_str.startswith('#') else 0.0

                    if not unit_type or not item:
                        continue

                    eq = Equipment(
                        contractor_id=target_cid,
                        unit_type=unit_type,
                        item=item,
                        activity=activity,
                        qty=qty,
                        productivity=productivity
                    )
                    db.add(eq)
                    eq_objs.append(eq)
            db.commit()
            print(f'✅ Loaded {len(eq_objs)} Equipment rows')

        # 2b. Tambahkan fleet Loading yang realistis dan deterministik.
        # Data CSV tetap menjadi sumber utama; baris sintetis hanya ditambahkan
        # bila kombinasi contractor + unit_type + activity belum tersedia.
        loading_specs = [
            ('EX26007', 920.0, (2, 5)),
            ('PC125011R', 310.0, (10, 20)),
            ('PC1250SP8', 320.0, (8, 16)),
            ('PC200011R', 820.0, (10, 20)),
            ('PC20008', 480.0, (8, 18)),
            ('PC3400', 940.0, (1, 3)),
            ('PC3400EX11', 1160.0, (1, 2)),
        ]
        rng = random.Random(2026)
        existing_loading = {
            (eq.contractor_id, eq.unit_type, eq.activity.upper())
            for eq in db.query(Equipment).all()
        }
        synthetic_count = 0
        for contractor_index, contractor_id in enumerate(contractor_ids):
            # Lima tipe per contractor memberi variasi fleet tanpa membuat
            # seluruh contractor memiliki konfigurasi identik.
            selected_indexes = [
                (contractor_index + offset) % len(loading_specs)
                for offset in range(5)
            ]
            for spec_index in selected_indexes:
                unit_type, base_productivity, qty_range = loading_specs[spec_index]
                key = (contractor_id, unit_type, 'LOADING')
                if key in existing_loading:
                    continue
                productivity_factor = rng.choice([0.92, 0.96, 1.00, 1.04, 1.08])
                equipment = Equipment(
                    contractor_id=contractor_id,
                    unit_type=unit_type,
                    item='Excavator OB',
                    activity='Loading',
                    qty=rng.randint(*qty_range),
                    productivity=round(base_productivity * productivity_factor, 1),
                )
                db.add(equipment)
                existing_loading.add(key)
                synthetic_count += 1
        db.commit()
        print(f'✅ Added {synthetic_count} realistic synthetic Loading equipment rows')

        # 3. Seed Ref Fuel (GLOBAL)
        fuel_csv = os.path.join(data_dir, 'Ref Fuel - Sheet1.csv')
        fr_objs = []
        if os.path.exists(fuel_csv):
            with open(fuel_csv, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    merk = row.get('MERK', '').strip()
                    ftype = row.get('TYPE', '').strip()
                    activity = row.get('ACTIVITY', '').strip()

                    def parse_f(val_str):
                        try:
                            val = float(val_str.strip().replace(',', '.'))
                            return val if val >= 0 else 1.0
                        except ValueError:
                            return 1.0

                    avg_val = parse_f(row.get(' Average ', row.get('Average', '1')))
                    low_val = parse_f(row.get(' Low ', row.get('Low', '1')))
                    mid_val = parse_f(row.get(' Mid ', row.get('Mid', '1')))
                    high_val = parse_f(row.get(' High ', row.get('High', '1')))

                    if not merk or not ftype:
                        continue

                    fr = FuelReference(
                        merk=merk,
                        type=ftype,
                        activity=activity,
                        average=avg_val,
                        low=low_val,
                        mid=mid_val,
                        high=high_val
                    )
                    db.add(fr)
                    fr_objs.append(fr)
            db.commit()
            print(f'✅ Loaded {len(fr_objs)} Fuel Reference rows')

        # 4. Create Loading Transactions and derived summaries from master data.
        # Idempotent: setiap equipment Loading hanya memiliki satu transaksi
        # backfill terbaru dan satu loading_summary.
        from app.services.loading_service import backfill_loading_summaries

        loading_result = backfill_loading_summaries(db, demo_actuals=True)
        print(
            '✅ Created/updated Loading Summary: '
            f"{loading_result['summary_created_or_updated']} summaries "
            f"from {loading_result['equipment_processed']} equipment rows"
        )
        trend_points = seed_loading_trend_history(db, hours=12)
        print(f'✅ Created {trend_points} historical Loading transactions for the 12-hour trend')

        # 5. Seed Hauling Distance Reference
        hauling_dist_csv = os.path.join(data_dir, 'Hauling Distance Ref - Sheet1.csv')
        dist_count = 0
        if os.path.exists(hauling_dist_csv):
            with open(hauling_dist_csv, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    hdr = HaulingDistanceRef(
                        load_time=float(row['load']),
                        haul_time=float(row['haul']),
                        dump_time=float(row['dump']),
                        return_time=float(row['return_time']),
                        cycle_time=float(row['cycle_time']),
                        km=float(row['km']),
                        bcm_per_hr=float(row['bcm_per_hr']),
                    )
                    db.add(hdr)
                    dist_count += 1
            db.commit()
            print(f'✅ Loaded {dist_count} Hauling Distance Reference rows (0.50 - 10.40 km)')

        # 5. Create Sample Hauling Transaction (Distance 3.90 km)
        dump_truck = db.query(Equipment).filter(Equipment.unit_type == 'HD7857').first()
        # Sesuaikan qty sample equipment ke 1 unit agar fuel_cons per unit = 77.0 L/jam
        if dump_truck:
            dump_truck.qty = 1
            db.commit()

        hauling_fuel_ref = db.query(FuelReference).filter(FuelReference.type == 'HD785-7').first()
        if not hauling_fuel_ref:
            hauling_fuel_ref = db.query(FuelReference).filter(FuelReference.type.like('%785%')).first()

        if dump_truck and hauling_fuel_ref:
            from app.services.hauling_service import create_hauling
            from app.schemas.hauling import HaulingCreate

            sample_hauling = create_hauling(
                db=db,
                data=HaulingCreate(
                    equipment_id=dump_truck.id,
                    fuel_reference_id=hauling_fuel_ref.id,
                    distance_km=3.90,
                )
            )
            print(f'✅ Created Sample Hauling Transaction: distance=3.90km | fuel_ratio={sample_hauling.summary.fuel_ratio}')

        # 6. Create Sample Supporting Transactions (CAT14M3, D155-6, D375-6, etc)
        cat_grader = db.query(Equipment).filter(Equipment.unit_type == 'CAT14M3').first()
        cat_fuel = db.query(FuelReference).filter(FuelReference.type == '14M').first()
        if not cat_fuel:
            cat_fuel = db.query(FuelReference).filter(FuelReference.merk == 'CATERPILLAR').first()

        if cat_grader and cat_fuel:
            from app.services.supporting_service import create_supporting
            from app.schemas.supporting import SupportingCreate

            sample_sup = create_supporting(
                db=db,
                data=SupportingCreate(
                    equipment_id=cat_grader.id,
                    fuel_reference_id=cat_fuel.id,
                    pa=0.90,
                    ua=0.53,
                    ewh=4121.0,
                    total_mine_prod_bcm=91276500.0,
                )
            )
            print(f'✅ Created Sample Supporting Transaction: unit={cat_grader.unit_type} | fuel_ratio={sample_sup.summary.fuel_ratio}')

        # 7. Create Sample Dewatering Transaction (DNDLSA6X8, KSB, etc)
        from app.services.dewatering_service import auto_calculate_all_dewatering
        from app.schemas.dewatering import DewateringBatchCalculateRequest

        dew_batch_res = auto_calculate_all_dewatering(
            db=db,
            pa=0.90,
            ua=0.63,
            ewh=4899.0,
            total_mine_prod_bcm=91276500.0,
        )
        print(f'✅ Created Sample Dewatering Batch: {dew_batch_res["total_units_processed"]} units | overall_fuel_ratio={dew_batch_res["overall_fuel_ratio"]}')

        print('🎉 Seeding selesai dengan sukses!')

    except Exception as e:
        db.rollback()
        print(f'❌ Seed gagal: {e}')
        raise
    finally:
        db.close()


if __name__ == '__main__':
    seed()
