import type { Metadata } from "next";
import { ContractorPerformanceClient } from "@/components/pages/ContractorPerformanceClient";

export const metadata: Metadata = { title: "Kinerja Kontraktor", description: "Evaluasi kinerja dan risiko kontraktor." };
export default function ContractorPerformancePage() { return <ContractorPerformanceClient />; }
