import type { Metadata } from "next";
import { FuzzyRuleGuideClient } from "@/components/pages/FuzzyRuleGuideClient";

export const metadata: Metadata = {
  title: "Panduan Aturan Risiko",
  description: "Penjelasan aturan fuzzy untuk evaluasi risiko kontraktor.",
};

export default function FuzzyRuleGuidePage() {
  return <FuzzyRuleGuideClient />;
}
