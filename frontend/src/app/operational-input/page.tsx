import type { Metadata } from "next";
import { OperationalInputClient } from "@/components/pages/OperationalInputClient";

export const metadata: Metadata = {
  title: "Input Fuel Ratio",
  description: "Input dan kalkulasi Fuel Ratio operasional per aktivitas.",
};

export default function OperationalInputPage() {
  return <OperationalInputClient />;
}
