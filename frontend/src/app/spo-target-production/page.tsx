import type { Metadata } from "next";
import { SPOAlignmentClient } from "@/components/pages/SPOAlignmentClient";

export const metadata: Metadata = {
  title: "SPO & Target Produksi",
  description: "Penyelarasan fuel ratio dengan SPO dan target produksi.",
};

export default function SPOTargetProductionPage() {
  return <SPOAlignmentClient />;
}
