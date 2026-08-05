"use client";

import { useState } from "react";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { MultiContractorFuelRatio } from "@/components/dashboard/MultiContractorFuelRatio";
import { ActivityFuelConsumption } from "@/components/dashboard/ActivityFuelConsumption";
import { SPOAlignment } from "@/components/dashboard/SPOAlignment";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function Home() {
  // 0 = Executive Overview, 1-3 = fitur utama FRMS.
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <DashboardShell activeFeature={activeFeature} setActiveFeature={setActiveFeature}>
      {activeFeature === 0 && <ExecutiveOverview />}
      {activeFeature === 1 && <MultiContractorFuelRatio />}
      {activeFeature === 2 && <ActivityFuelConsumption />}
      {activeFeature === 3 && <SPOAlignment />}
    </DashboardShell>
  );
}
