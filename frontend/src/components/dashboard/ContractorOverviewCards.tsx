"use client";

import React from "react";
import { Building2, Fuel, Gauge, Award } from "lucide-react";

interface OverviewProps {
  selectedContractor: string;
  totalContractors: number;
  overallFuelRatio: number;
  topEfficientContractor: string;
  totalFuelLiters: number;
  totalMineBcm: number;
}

export const ContractorOverviewCards: React.FC<OverviewProps> = ({
  selectedContractor,
  totalContractors,
  overallFuelRatio,
  topEfficientContractor,
  totalFuelLiters,
  totalMineBcm,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Active Contractors */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cakupan Kontraktor</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Building2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold text-white tracking-tight">
            {selectedContractor === "ALL" ? `${totalContractors} Perusahaan` : selectedContractor}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {selectedContractor === "ALL" ? "PT. A s/d PT. J Terdaftar" : "Filtered Active Contractor"}
          </p>
        </div>
      </div>

      {/* Card 2: Overall Multi-Contractor Fuel Ratio */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rata-Rata Fuel Ratio</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Gauge className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-2">
            {overallFuelRatio.toFixed(2)}
            <span className="text-xs font-normal text-slate-400">L/BCM</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Target SPO: &lt; 0.25 L/BCM
          </div>
        </div>
      </div>

      {/* Card 3: Top Efficient Contractor */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kontraktor Ter-Efisien</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold text-white tracking-tight">
            {topEfficientContractor}
          </div>
          <p className="text-xs text-emerald-400 mt-1 font-medium">Efisiensi Tertinggi (0.20 L/BCM)</p>
        </div>
      </div>

      {/* Card 4: Total Solar Liters */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Solar Terkonsumsi</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Fuel className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
            {(totalFuelLiters / 1000000).toFixed(1)}M
            <span className="text-xs font-normal text-slate-400">Liter</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Total Solar Penggunaan Armada</p>
        </div>
      </div>
    </div>
  );
};
