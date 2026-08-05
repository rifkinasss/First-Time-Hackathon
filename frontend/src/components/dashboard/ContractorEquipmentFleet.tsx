"use client";

import React, { useState } from "react";
import { Equipment } from "@/lib/api";
import { Wrench, Activity, Truck, HardHat, Anchor, Fuel, Gauge, Layers } from "lucide-react";

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
          desc: "Penggalian & Pemuatan OB",
        };
      case "Hauling":
        return {
          icon: Truck,
          color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          desc: "Pengangkutan (Jarak 3.90 km / 110 BCM/HR)",
        };
      case "Supporting":
        return {
          icon: HardHat,
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          desc: "Armada Support (PA 90%, UA 53%, EWH 4121h)",
        };
      default:
        return {
          icon: Anchor,
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          desc: "Pompa Pengeringan (PA 90%, UA 63%, EWH 4899h)",
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

            let estLhr = 187.0;
            let estRatio = 0.20;

            if (eq.activity === "Loading") {
              estLhr = eq.unit_type.includes("EX2600") ? 187.0 : 145.0;
              const prod = eq.productivity || 920.0;
              estRatio = parseFloat(((eq.qty * estLhr) / (eq.qty * prod)).toFixed(2));
            } else if (eq.activity === "Hauling") {
              estLhr = 77.0;
              estRatio = 0.70;
            } else if (eq.activity === "Supporting") {
              estLhr = 29.0;
              estRatio = 0.19;
            } else {
              estLhr = 40.0;
              estRatio = 0.18;
            }

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

                {/* Bottom Fuel Consumption & Fuel Ratio */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Fuel className="h-3.5 w-3.5 text-amber-400" />
                    <span>Est. BBM: <strong className="text-slate-200 font-mono">{estLhr} L/h</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
                    <Gauge className="h-3.5 w-3.5" />
                    <span>{estRatio.toFixed(2)} L/BCM</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
