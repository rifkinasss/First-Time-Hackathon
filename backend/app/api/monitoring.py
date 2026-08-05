from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.calculations import calculate_actual_fr, build_units, filtered_units, make_summary
from app.config import ACTIVITIES, ActivityName
from app.data import get_contractors
from app.schemas.monitoring import ActivityResponse, OverviewResponse, TrendPoint
from app.trends import make_trend


router = APIRouter(tags=["monitoring"])


@router.get("/overview", response_model=OverviewResponse)
def overview(
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    contractor: str | None = None,
    unit: str | None = None,
    db: Session = Depends(get_db)
) -> OverviewResponse:
    try:
        start = date.fromisoformat(from_date) if from_date else None
        end = date.fromisoformat(to_date) if to_date else None
    except ValueError as error:
        raise HTTPException(status_code=422, detail="Date filters must use YYYY-MM-DD") from error
    if start and end and start > end:
        raise HTTPException(status_code=422, detail="The 'from' date must be before the 'to' date")

    activity_units = {activity: filtered_units(activity, contractor, unit, db=db) for activity in ACTIVITIES}
    
    activity_trends = {activity: make_trend(activity, db=db) for activity in ACTIVITIES}
    if start:
        activity_trends = {activity: [point for point in activity_trends[activity] if date.fromisoformat(point.date) >= start] for activity in ACTIVITIES}
    if end:
        activity_trends = {activity: [point for point in activity_trends[activity] if date.fromisoformat(point.date) <= end] for activity in ACTIVITIES}

    # If the date filter completely excludes the available trend window, empty the units
    if (start or end) and not activity_trends["loading"]:
        activity_units = {activity: [] for activity in ACTIVITIES}

    summaries = [make_summary(activity, activity_units[activity]) for activity in ACTIVITIES]
    trend: list[TrendPoint] = []
    
    if activity_trends["loading"]:
        for index in range(len(activity_trends["loading"])):
            points = [activity_trends[activity][index] for activity in ACTIVITIES]
            trend.append(
                TrendPoint(
                    date=points[0].date,
                    actualFR=round(sum(point.actualFR for point in points), 4),
                    spoFR=round(sum(point.spoFR for point in points), 4),
                    fuelConsumption=round(sum(point.fuelConsumption for point in points), 0),
                    production=round(sum(point.production for point in points), 0),
                )
            )

    contractors = get_contractors(db=db)

    return OverviewResponse(
        totalFuelConsumption=round(sum(summary.fuelConsumption for summary in summaries), 2),
        totalProduction=round(sum(summary.productivity for summary in summaries), 2),
        averageFuelRatio=round(
            sum(calculate_actual_fr(activity, activity_units[activity]) for activity in ACTIVITIES),
            4,
        ),
        totalContractors=len(contractors),
        totalEquipment=sum(summary.equipmentCount for summary in summaries),
        averageProductivity=round(sum(item.productivity for item in summaries[:2]) / 2, 2) if summaries else 0,
        trend=trend,
        activities=summaries,
    )


@router.get("/fuel-ratio/{activity}", response_model=ActivityResponse)
def fuel_ratio(
    activity: ActivityName,
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    contractor: str | None = None,
    unit: str | None = None,
    db: Session = Depends(get_db),
) -> ActivityResponse:
    if activity not in ACTIVITIES:
        raise HTTPException(status_code=404, detail="Unknown activity")
    try:
        start = date.fromisoformat(from_date) if from_date else None
        end = date.fromisoformat(to_date) if to_date else None
    except ValueError as error:
        raise HTTPException(status_code=422, detail="Date filters must use YYYY-MM-DD") from error
    if start and end and start > end:
        raise HTTPException(status_code=422, detail="The 'from' date must be before the 'to' date")

    units = filtered_units(activity, contractor, unit, db=db)
    trend = make_trend(activity, db=db)
    if start:
        trend = [point for point in trend if date.fromisoformat(point.date) >= start]
    if end:
        trend = [point for point in trend if date.fromisoformat(point.date) <= end]

    # If the date filter completely excludes the available trend window (e.g. year 2029),
    # we should also empty the units so the table and KPIs correctly reflect 'no data'.
    if not trend and (start or end):
        units = []

    contractors = get_contractors(db=db)

    return ActivityResponse(
        activity=activity,
        label=ACTIVITIES[activity]["label"],
        units=units,
        trend=trend,
        summary=make_summary(activity, units),
        contractors=contractors,
    )
