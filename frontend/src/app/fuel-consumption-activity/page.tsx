import type { Metadata } from "next";
import { ActivityFuelConsumptionClient } from "@/components/pages/ActivityFuelConsumptionClient";

export const metadata: Metadata = {
  title: "Konsumsi Fuel Aktivitas",
  description: "Monitoring konsumsi fuel berdasarkan aktivitas operasional.",
};

export default function ActivityFuelConsumptionPage() {
  return <ActivityFuelConsumptionClient />;
}
