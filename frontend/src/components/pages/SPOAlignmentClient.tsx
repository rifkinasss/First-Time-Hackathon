"use client";

import { SPOAlignment } from "@/components/dashboard/SPOAlignment";
import { DashboardShell } from "@/components/layout/DashboardShell";

export function SPOAlignmentClient() {
  return <DashboardShell activeFeature={3}><SPOAlignment /></DashboardShell>;
}
