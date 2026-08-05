"use client";

import React, { useState } from "react";
import { Equipment } from "@/lib/api";
import { Wrench, Activity, Truck, HardHat, Anchor, Layers } from "lucide-react";

interface FleetProps {
  selectedContractorCode: string;
  selectedContractorName: string;
  equipments: Equipment[];
}

export const ContractorEquipmentFleet: React.FC<FleetProps> = ({
  selectedContractorCode,
  selectedContractorName,
  equipments,
}) => {
  const [subFeature, setSubFeature] = useState<string>("ALL");
  const activityOrder = ["Loading", "Hauling", "Supporting", "Dewatering"];
  const activityColors: Record<string, { fill: string; text: string }> = {
    Loading: { fill: "bg-amber-500", text: "text-amber-600" },
    Hauling: { fill: "bg-sky-500", text: "text-sky-600" },
    Supporting: { fill: "bg-violet-500", text: "text-violet-600" },
    Dewatering: { fill: "bg-emerald-500", text: "text-emerald-600" },
  };
  const activityHex: Record<string, string> = { Loading: "#f59e0b", Hauling: "#0ea5e9", Supporting: "#8b5cf6", Dewatering: "#10b981" };
  const activityUnits = Object.fromEntries(activityOrder.map((activity) => [activity, equipments.filter((item) => item.activity === activity).reduce((total, item) => total + item.qty, 0)]));
  const totalUnits = Object.values(activityUnits).reduce((total, value) => total + value, 0);
  let angle = 0;
  const compositionGradient = activityOrder.filter((activity) => activityUnits[activity] > 0).map((activity) => {
    const start = angle;
    angle += (activityUnits[activity] / Math.max(totalUnits, 1)) * 360;
    return `${activityHex[activity]} ${start}deg ${angle}deg`;
  }).join(", ");

  // Filter equipment based on sub-feature tab
  const filteredEquipments = subFeature === "ALL"
    ? equipments
    : equipments.filter((e) => e.activity.toLowerCase() === subFeature.toLowerCase());

  // Map activity to icons & badges
  const getActivityBadge = (act: string) => {
    switch (act) {
      case "Loading":
        return {
          icon: Activity,
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          desc: "Penggalian dan pemuatan overburden",
        };
      case "Hauling":
        return {
          icon: Truck,
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          desc: "Armada pengangkutan",
        };
      case "Supporting":
        return {
          icon: HardHat,
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          desc: "Armada peralatan pendukung",
        };
      default:
        return {
          icon: Anchor,
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          desc: "Peralatan pengeringan tambang",
        };
    }
  };

  const subFeatureTabs = [
    { id: "ALL", label: "All Activities", icon: Layers, count: equipments.length },
    { id: "Loading", label: "Loading", icon: Activity, count: equipments.filter(e => e.activity === "Loading").length },
    { id: "Hauling", label: "Hauling", icon: Truck, count: equipments.filter(e => e.activity === "Hauling").length },
    { id: "Supporting", label: "Supporting", icon: HardHat, count: equipments.filter(e => e.activity === "Supporting").length },
    { id: "Dewatering", label: "Dewatering", icon: Anchor, count: equipments.filter(e => e.activity === "Dewatering").length },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm mb-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Armada & Detail Peralatan — {selectedContractorName}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono border border-slate-700">
                {selectedContractorCode === "ALL" ? "All Contractors" : selectedContractorCode}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih Sub-Fitur aktivitas di bawah untuk menapis detail alat berat spesifik.
            </p>
          </div>
        </div>

        {/* Quick Fleet Counter */}
        <div className="flex items-center gap-3 text-xs bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 font-mono">
          <div className="text-center">
            <span className="text-slate-400 block text-[10px]">TOTAL UNIT</span>
            <span className="font-bold text-white text-base">
              {filteredEquipments.reduce((acc, curr) => acc + curr.qty, 0)} Unit
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="text-center">
            <span className="text-slate-400 block text-[10px]">ARMADA TERFILTER</span>
            <span className="font-bold text-amber-400 text-base">{filteredEquipments.length} Tipe</span>
          </div>
        </div>
      </div>

      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600">Fleet overview</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900">Komposisi Armada per Aktivitas</h3>
            <p className="mt-1 text-[11px] text-slate-500">Proporsi populasi unit pada kontraktor yang sedang dipilih.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold text-slate-700">{totalUnits.toLocaleString("id-ID")} unit</span>
        </div>
        <div className="grid items-center gap-7 sm:grid-cols-[156px_minmax(0,1fr)]">
          <div className="relative mx-auto grid h-36 w-36 place-items-center rounded-full bg-slate-100 p-1">
            <div className="relative h-full w-full rounded-full" style={{ background: compositionGradient ? `conic-gradient(${compositionGradient})` : "#0f172a" }} role="img" aria-label="Diagram donat komposisi armada per aktivitas">
              <div className="absolute inset-[21px] flex flex-col items-center justify-center rounded-full border border-slate-100 bg-white text-center"><strong className="font-mono text-2xl tracking-tight text-slate-900">{totalUnits}</strong><span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Total unit</span></div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">{activityOrder.map((activity) => { const percent = totalUnits ? (activityUnits[activity] / totalUnits) * 100 : 0; return <div key={activity} className="rounded-xl px-2 py-2"><div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-2 font-medium text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${activityColors[activity].fill}`} />{activity}</span><span className="font-mono"><b className={activityColors[activity].text}>{activityUnits[activity]}</b><span className="ml-1 text-slate-500">unit</span></span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${activityColors[activity].fill}`} style={{ width: `${percent}%` }} /></div><p className="mt-1 text-right text-[10px] text-slate-500">{percent.toFixed(1)}% dari total armada</p></div>; })}</div>
        </div>
      </section>

      {/* Sub-Feature Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
        {subFeatureTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subFeature === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubFeature(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                  isActive ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Equipment List Grid */}
      {filteredEquipments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800/80">
          Tidak ada data armada alat berat terdaftar untuk sub-fitur aktivitas <strong>{subFeature}</strong> pada kontraktor ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map((eq) => {
            const badge = getActivityBadge(eq.activity);
            const Icon = badge.icon;

            return (
              <div
                key={eq.id}
                className="bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-sm font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
                        {eq.unit_type}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">{eq.item}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      <Icon className="h-3 w-3" />
                      {eq.activity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{badge.desc}</p>

                  {/* Operational Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kuantitas Unit</span>
                      <span className="font-bold text-white font-mono">{eq.qty} Unit</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Produktivitas</span>
                      <span className="font-bold text-white font-mono">
                        {eq.productivity ? `${eq.productivity} BCM/h` : "Acuan Jarak / Mine BCM"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-500">Fuel rate dan Fuel Ratio ditampilkan pada ringkasan aktivitas bila summary tersedia.</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
