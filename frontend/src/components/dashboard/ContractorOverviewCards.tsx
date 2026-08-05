"use client";

import { Award, Building2, Factory, Fuel, Gauge } from "lucide-react";

interface OverviewProps {
  selectedContractor: string;
  totalEquipment: number;
  overallFuelRatio: number | null;
  topEfficientContractor: string;
  totalProduction: number;
  fuelThirtyDayEstimate: number;
}

export function ContractorOverviewCards({ selectedContractor, totalEquipment, overallFuelRatio, topEfficientContractor, totalProduction, fuelThirtyDayEstimate }: OverviewProps) {
  const cards = [
    ["Unit Terdaftar", `${totalEquipment.toLocaleString("id-ID")} unit`, selectedContractor === "ALL" ? "Total unit seluruh kontraktor" : `Unit milik ${selectedContractor}`, Building2, "text-amber-400"],
    ["Fuel Ratio Snapshot", overallFuelRatio === null ? "—" : `${overallFuelRatio.toFixed(3)} L/BCM`, "Rata-rata summary yang tersedia", Gauge, "text-cyan-400"],
    ["Kontraktor Terendah", topEfficientContractor, "Fuel Ratio summary terendah", Award, "text-emerald-400"],
    ["Total Produksi", `${totalProduction.toLocaleString("id-ID", { maximumFractionDigits: 1 })} BCM/Hr`, "Dari summary Loading & Hauling", Factory, "text-emerald-400"],
    ["Total Konsumsi Fuel Akumulasi 30 Hari", `${fuelThirtyDayEstimate.toLocaleString("id-ID", { maximumFractionDigits: 0 })} L`, "Estimasi dari fuel rate × 720 jam operasi", Fuel, "text-purple-400"],
  ] as const;

  return <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, helper, Icon, color]) => <div key={label} className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm"><div className="flex items-center justify-between gap-3"><span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span><Icon className={`h-5 w-5 shrink-0 ${color}`} /></div><p className="mt-3 text-2xl font-bold tracking-tight text-white">{value}</p><p className="mt-1 text-xs text-slate-400">{helper}</p></div>)}</section>;
}
