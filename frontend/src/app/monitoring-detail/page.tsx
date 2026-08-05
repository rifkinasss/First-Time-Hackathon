import type { Metadata } from "next";
import { MonitoringDetailClient } from "@/components/pages/MonitoringDetailClient";

export const metadata: Metadata = { title: "Detail Monitoring", description: "Detail fuel ratio per aktivitas." };
export default function MonitoringDetailPage() { return <MonitoringDetailClient />; }
