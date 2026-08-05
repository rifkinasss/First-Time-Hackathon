export type ActivityKey = "loading" | "hauling" | "supporting" | "dewatering";

export type UnitRecord = {
  unitType: string;
  category?: string | null;
  contractor: string;
  qty: number;
  fuelConsumption: number;
  productivity?: number | null;
  PA?: number | null;
  UA?: number | null;
  EWH?: number | null;
  fuelRatio: number;
  spoTarget: number;
  variancePct: number;
};

export type TrendPoint = {
  date: string;
  actualFR: number;
  spoFR: number;
  fuelConsumption: number;
  production: number;
};

export type ActivitySummary = {
  activity: ActivityKey;
  label: string;
  actualFR: number;
  spoFR: number;
  variancePct: number;
  fuelConsumption: number;
  productivity: number;
  equipmentCount: number;
};

export type ActivityResponse = {
  activity: ActivityKey;
  label: string;
  units: UnitRecord[];
  trend: TrendPoint[];
  summary: ActivitySummary;
  contractors: string[];
};

export type OverviewResponse = {
  totalFuelConsumption: number;
  totalProduction: number;
  averageFuelRatio: number;
  totalContractors: number;
  totalEquipment: number;
  averageProductivity: number;
  trend: TrendPoint[];
  activities: ActivitySummary[];
};

export type Filters = {
  from: string;
  to: string;
  contractor: string;
  unit: string;
};

export const ACTIVITY_META: Record<ActivityKey, {
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  color: string;
}> = {
  loading: {
    label: "Loading",
    shortLabel: "Loading",
    description: "Excavator production performance",
    icon: "excavator",
    color: "amber",
  },
  hauling: {
    label: "Hauling",
    shortLabel: "Hauling",
    description: "Hauler cycle efficiency",
    icon: "hauling",
    color: "orange",
  },
  supporting: {
    label: "Supporting",
    shortLabel: "Supporting",
    description: "Support fleet utilization",
    icon: "supporting",
    color: "teal",
  },
  dewatering: {
    label: "Dewatering",
    shortLabel: "Dewatering",
    description: "Pump & dredger operating load",
    icon: "dewatering",
    color: "blue",
  },
};

export const DEFAULT_FILTERS: Filters = {
  from: "2026-07-01",
  to: "2026-07-21",
  contractor: "all",
  unit: "all",
};
