import { ACTIVITY_META, ActivityKey, ActivityResponse, MonitoringFilters, OverviewResponse, TrendPoint, UnitRecord } from "./frms-types";

const spo: Record<ActivityKey, number> = {
  loading: 0.1325,
  hauling: 0.6007,
  supporting: 0.1879,
  dewatering: 0.3233,
};
// Workbook O26/X26: 1.05 x 86,930,000 BCM.
const totalAnnualProductionBcm = 1.05 * 86_930_000;
const hoursPerYear = 24 * 360;

const contractors = Array.from({ length: 10 }, (_, i) => `PT. ${String.fromCharCode(65 + i)}`);

const rawUnits: Record<ActivityKey, Array<Record<string, string | number>>> = {
  loading: [
    { unitType: "EX26007", qty: 3, fuelConsumption: 187, productivity: 920 },
    { unitType: "PC125011R", qty: 18, fuelConsumption: 59, productivity: 310 },
    { unitType: "PC1250SP8", qty: 12, fuelConsumption: 64, productivity: 320 },
    { unitType: "PC200011R", qty: 18, fuelConsumption: 100, productivity: 820 },
    { unitType: "PC20008", qty: 16, fuelConsumption: 100, productivity: 480 },
    { unitType: "PC3400", qty: 2, fuelConsumption: 12, productivity: 940 },
    { unitType: "PC3400EX11", qty: 1, fuelConsumption: 21, productivity: 1160 },
  ],
  hauling: [
    { unitType: "HD7857", qty: 400, fuelConsumption: 77, productivity: 109.5652 },
    { unitType: "HD7858", qty: 15, fuelConsumption: 77, productivity: 109.5652 },
  ],
  supporting: [
    { unitType: "CAT14M3", category: "Motor Grader", qty: 3, fuelConsumption: 16 },
    { unitType: "D155-6", category: "Bulldozer", qty: 8, fuelConsumption: 29 },
    { unitType: "D155A6A", category: "Bulldozer", qty: 4, fuelConsumption: 29 },
    { unitType: "D155A6R", category: "Bulldozer", qty: 36, fuelConsumption: 29 },
    { unitType: "D155A-6R", category: "Bulldozer", qty: 9, fuelConsumption: 29 },
    { unitType: "D375-6", category: "Bulldozer", qty: 10, fuelConsumption: 67 },
    { unitType: "D375A6R", category: "Bulldozer", qty: 20, fuelConsumption: 67 },
    { unitType: "D85ESS2", category: "Bulldozer", qty: 3, fuelConsumption: 27 },
    { unitType: "GD825A2", category: "Motor Grader", qty: 49, fuelConsumption: 29 },
    { unitType: "FMX440WT", category: "Water truck", qty: 2, fuelConsumption: 23 },
    { unitType: "FM9", category: "Fuel truck", qty: 3, fuelConsumption: 30 },
    { unitType: "FMX440FT", category: "Fuel truck", qty: 20, fuelConsumption: 44 },
    { unitType: "HD7857WT", category: "Water truck", qty: 22, fuelConsumption: 77 },
    { unitType: "P360CB6X6", category: "Fuel truck", qty: 3, fuelConsumption: 26 },
    { unitType: "P360CB6X6WT", category: "Water truck", qty: 6, fuelConsumption: 26 },
    { unitType: "P360CB8X4", category: "Fuel truck", qty: 3, fuelConsumption: 30 },
    { unitType: "P380CB6X6", category: "Fuel truck", qty: 3, fuelConsumption: 30 },
    { unitType: "PC200SC", category: "Excavator Coal", qty: 9, fuelConsumption: 25 },
    { unitType: "PC300", category: "Excavator Coal", qty: 61, fuelConsumption: 35 },
    { unitType: "PC400", category: "Excavator Mud", qty: 3, fuelConsumption: 45 },
    { unitType: "PC400DF", category: "Excavator Mud", qty: 6, fuelConsumption: 45 },
    { unitType: "PC800SC", category: "Hydraulic Excavator", qty: 2, fuelConsumption: 65 },
    { unitType: "PC8508R1", category: "Excavator Support", qty: 1, fuelConsumption: 70 },
    { unitType: "PC850SP8", category: "Excavator Support", qty: 2, fuelConsumption: 70 },
  ],
  dewatering: [
    { unitType: "DNDLSA6X8", category: "Water Pump", qty: 6, fuelConsumption: 40 },
    { unitType: "DREDGER 12/10", category: "Water Pump", qty: 2, fuelConsumption: 75 },
    { unitType: "DREDGERPUMP", category: "Water Pump", qty: 7, fuelConsumption: 75 },
    { unitType: "DRHY85160B", category: "Water Pump", qty: 9, fuelConsumption: 45 },
    { unitType: "EGS380-6", category: "Water Pump", qty: 3, fuelConsumption: 10 },
    { unitType: "EWP420", category: "Water Pump", qty: 40, fuelConsumption: 40 },
    { unitType: "KSB", category: "Water Pump", qty: 6, fuelConsumption: 25 },
    { unitType: "MEB420EXHV", category: "Water Pump", qty: 30, fuelConsumption: 40 },
    { unitType: "MF420E", category: "Water Pump", qty: 12, fuelConsumption: 40 },
    { unitType: "MF-420E", category: "Water Pump", qty: 3, fuelConsumption: 40 },
    { unitType: "MF420EX", category: "Water Pump", qty: 6, fuelConsumption: 40 },
    { unitType: "MF420EXHV", category: "Water Pump", qty: 20, fuelConsumption: 40 },
    { unitType: "MFV290", category: "Water Pump", qty: 2, fuelConsumption: 13 },
    { unitType: "MFV290C", category: "Water Pump", qty: 4, fuelConsumption: 13 },
    { unitType: "MFV420EXHV", category: "Water Pump", qty: 20, fuelConsumption: 40 },
    { unitType: "RF85MW", category: "Water Pump", qty: 10, fuelConsumption: 50 },
    { unitType: "RF-85MW", category: "Water Pump", qty: 5, fuelConsumption: 50 },
  ],
};

const round = (value: number, digits = 4) => Number(value.toFixed(digits));

function makeTrend(activity: ActivityKey): TrendPoint[] {
  const phase = { loading: 0.2, hauling: 1.1, supporting: 2, dewatering: 2.8 }[activity];
  const actualBase = calculatedActivityFR(activity, makeUnits(activity));
  return Array.from({ length: 21 }, (_, index) => {
    const wave = 1 + 0.045 * Math.sin(index * 0.85 + phase) + 0.025 * Math.cos(index * 0.31);
    return {
      date: `2026-07-${String(index + 1).padStart(2, "0")}`,
      actualFR: round(actualBase * wave),
      spoFR: round(spo[activity] * (1 + 0.008 * Math.sin(index * 0.4))),
      fuelConsumption: Math.round((10000 + index * 135) * wave),
      production: Math.round((10000 + index * 110) / wave),
    };
  });
}

function makeUnits(activity: ActivityKey): UnitRecord[] {
  return rawUnits[activity].map((item, index) => {
    const productivity = typeof item.productivity === "number" ? item.productivity : null;
    const qty = Number(item.qty);
    const pa = activity === "supporting" || activity === "dewatering" ? 0.9 : null;
    const ua = activity === "supporting" ? 0.53 : activity === "dewatering" ? 0.63 : null;
    const ewh = pa !== null && ua !== null ? pa * ua * hoursPerYear : null;
    const fuelRatio = activity === "supporting" || activity === "dewatering"
      ? (qty * Number(ewh) * Number(item.fuelConsumption)) / totalAnnualProductionBcm
      : productivity
        ? Number(item.fuelConsumption) / productivity
        : 0;
    const target = spo[activity];
    return {
      unitType: String(item.unitType),
      category: typeof item.category === "string" ? item.category : null,
      contractor: contractors[index % contractors.length],
      qty,
      fuelConsumption: Number(item.fuelConsumption),
      productivity,
      PA: pa,
      UA: ua,
      EWH: ewh,
      fuelRatio: round(fuelRatio),
      spoTarget: target,
      variancePct: round((fuelRatio - target) / target * 100, 2),
    };
  });
}

function calculatedActivityFR(activity: ActivityKey, units: UnitRecord[]): number {
  if (activity === "supporting" || activity === "dewatering") {
    return units.reduce(
      (sum, row) => sum + (row.qty * (row.EWH ?? 0) * row.fuelConsumption) / totalAnnualProductionBcm,
      0,
    );
  }

  const fuelTotal = units.reduce((sum, row) => sum + row.qty * row.fuelConsumption, 0);
  const productivityTotal = units.reduce((sum, row) => sum + row.qty * (row.productivity ?? 0), 0);
  return productivityTotal ? fuelTotal / productivityTotal : 0;
}

function filteredMockUnits(units: UnitRecord[], filters?: MonitoringFilters): UnitRecord[] {
  const contractor = filters?.contractor && filters.contractor !== "all"
    ? filters.contractor.toLowerCase()
    : null;
  const unit = filters?.unit && filters.unit !== "all" ? filters.unit.toLowerCase() : null;

  return units.filter((row) => {
    const contractorMatches = !contractor || row.contractor.toLowerCase() === contractor;
    const unitMatches = !unit
      || row.unitType.toLowerCase().includes(unit)
      || (row.category ?? "").toLowerCase().includes(unit);
    return contractorMatches && unitMatches;
  });
}

function filteredMockTrend(trend: TrendPoint[], filters?: MonitoringFilters): TrendPoint[] {
  const from = filters?.from && filters.from !== "all" ? filters.from : null;
  const to = filters?.to && filters.to !== "all" ? filters.to : null;

  return trend.filter((point) => (!from || point.date >= from) && (!to || point.date <= to));
}

export function getMockActivity(activity: ActivityKey, filters?: MonitoringFilters): ActivityResponse {
  const allUnits = makeUnits(activity);
  const allTrend = makeTrend(activity);
  const trend = filteredMockTrend(allTrend, filters);
  const hasDateFilter = Boolean(
    (filters?.from && filters.from !== "all") || (filters?.to && filters.to !== "all"),
  );
  // The snapshot has no per-unit transaction date. If a date range misses the
  // available trend window, expose an empty result instead of stale KPIs.
  const units = hasDateFilter && trend.length === 0 ? [] : filteredMockUnits(allUnits, filters);
  const activityFR = calculatedActivityFR(activity, units);
  const productivity = units.reduce((total, row) => total + (row.productivity ?? 0) * row.qty, 0);
  const fuel = units.reduce((total, row) => total + row.fuelConsumption * row.qty, 0);
  return {
    activity,
    label: ACTIVITY_META[activity].label,
    units,
    trend,
    summary: {
      activity,
      label: ACTIVITY_META[activity].label,
      actualFR: round(activityFR),
      spoFR: spo[activity],
      variancePct: round((activityFR - spo[activity]) / spo[activity] * 100, 2),
      fuelConsumption: round(fuel, 2),
      productivity: round(productivity, 2),
      equipmentCount: units.reduce((total, row) => total + row.qty, 0),
    },
    contractors,
  };
}

export function getMockOverview(filters?: MonitoringFilters): OverviewResponse {
  const activityKeys = Object.keys(ACTIVITY_META) as ActivityKey[];
  const snapshots = activityKeys.map((activity) => getMockActivity(activity, filters));
  const activities = snapshots.map((snapshot) => snapshot.summary);
  const trends = snapshots.map((snapshot) => snapshot.trend);
  const trend = trends[0].map((point, index) => ({
    date: point.date,
    actualFR: round(trends.reduce((sum, series) => sum + series[index].actualFR, 0)),
    spoFR: round(trends.reduce((sum, series) => sum + series[index].spoFR, 0)),
    fuelConsumption: trends.reduce((sum, series) => sum + series[index].fuelConsumption, 0),
    production: trends.reduce((sum, series) => sum + series[index].production, 0),
  }));
  return {
    totalFuelConsumption: activities.reduce((sum, item) => sum + item.fuelConsumption, 0),
    totalProduction: activities.reduce((sum, item) => sum + item.productivity, 0),
    averageFuelRatio: round(activities.reduce((sum, item) => sum + item.actualFR, 0)),
    totalContractors: contractors.length,
    totalEquipment: activities.reduce((sum, item) => sum + item.equipmentCount, 0),
    averageProductivity: (activities[0].productivity + activities[1].productivity) / 2,
    trend,
    activities,
  };
}
