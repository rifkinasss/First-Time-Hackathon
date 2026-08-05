"use client";

import { ActivityFuelConsumption } from "@/components/dashboard/ActivityFuelConsumption";
import { DashboardShell } from "@/components/layout/DashboardShell";

export function ActivityFuelConsumptionClient() {
  return (
    <DashboardShell activeFeature={2}>
      <ActivityFuelConsumption />
    </DashboardShell>
  );
}
