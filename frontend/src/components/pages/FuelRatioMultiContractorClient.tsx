"use client";

import { MultiContractorFuelRatio } from "@/components/dashboard/MultiContractorFuelRatio";
import { DashboardShell } from "@/components/layout/DashboardShell";

export function FuelRatioMultiContractorClient() {
  return (
    <DashboardShell activeFeature={1}>
      <MultiContractorFuelRatio />
    </DashboardShell>
  );
}
