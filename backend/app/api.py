from __future__ import annotations

from datetime import date

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .calculations import calculate_actual_fr, build_units, filtered_units, make_summary
from .config import ACTIVITIES, ActivityName, CONTRACTORS
from .models import ActivityResponse, OverviewResponse, TrendPoint
from .trends import make_trend


app = FastAPI(
    title="Fuel Ratio Monitoring System API",
    version="1.0.0",
    description="Read-only MVP API for activity-based fuel ratio monitoring.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def root() -> dict[str, str]:
    return {"service": "FRMS API", "status": "ok"}


@app.get("/api/overview", response_model=OverviewResponse, tags=["monitoring"])
def overview() -> OverviewResponse:
    activity_units = {activity: build_units(activity) for activity in ACTIVITIES}
    summaries = [make_summary(activity, activity_units[activity]) for activity in ACTIVITIES]
    trend: list[TrendPoint] = []
    activity_trends = {activity: make_trend(activity) for activity in ACTIVITIES}
    for index in range(21):
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

    return OverviewResponse(
        totalFuelConsumption=round(sum(summary.fuelConsumption for summary in summaries), 2),
        totalProduction=round(sum(summary.productivity for summary in summaries), 2),
        averageFuelRatio=round(
            sum(calculate_actual_fr(activity, activity_units[activity]) for activity in ACTIVITIES),
            4,
        ),
        totalContractors=len(CONTRACTORS),
        totalEquipment=sum(summary.equipmentCount for summary in summaries),
        averageProductivity=round(sum(item.productivity for item in summaries[:2]) / 2, 2),
        trend=trend,
        activities=summaries,
    )


@app.get("/api/fuel-ratio/{activity}", response_model=ActivityResponse, tags=["monitoring"])
def fuel_ratio(
    activity: ActivityName,
    from_date: str | None = Query(default=None, alias="from"),
    to_date: str | None = Query(default=None, alias="to"),
    contractor: str | None = None,
    unit: str | None = None,
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

    units = filtered_units(activity, contractor, unit)
    trend = make_trend(activity)
    if start:
        trend = [point for point in trend if date.fromisoformat(point.date) >= start]
    if end:
        trend = [point for point in trend if date.fromisoformat(point.date) <= end]

    return ActivityResponse(
        activity=activity,
        label=ACTIVITIES[activity]["label"],
        units=units,
        trend=trend,
        summary=make_summary(activity, units),
        contractors=CONTRACTORS,
    )
