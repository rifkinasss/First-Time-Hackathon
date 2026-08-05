import type { Metadata } from "next";
import { FuelRatioMultiContractorClient } from "@/components/pages/FuelRatioMultiContractorClient";

export const metadata: Metadata = {
  title: "Fuel Ratio Multi-Kontraktor",
  description: "Monitoring fuel ratio dan risk score antar kontraktor.",
};

export default function FuelRatioMultiContractorPage() {
  return <FuelRatioMultiContractorClient />;
}
