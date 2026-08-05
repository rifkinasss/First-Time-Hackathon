"use client";

import React from "react";
import { BarChart3, TrendingUp, ChevronRight, Activity, Truck, Anchor, HardHat } from "lucide-react";

interface ContractorPerformance {
  code: string;
  name: string;
  fuelRatio: number;
  status: "Efisien" | "Optimal" | "Warning";
  loadingRatio: number;
  haulingRatio: number;
  supportingRatio: number;
  dewateringRatio: number;
}

interface LeaderboardProps {
  contractors: ContractorPerformance[];
  selectedContractor: string;
  onSelectContractor: (code: string) => void;
}

export const ContractorLeaderboardChart: React.FC<LeaderboardProps> = ({
  contractors,
  selectedContractor,
  onSelectContractor,
}) => {
  const filtered = selectedContractor === "ALL"
    ? contractors
    : contractors.filter((c) => c.code === selectedContractor);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Efisien":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Optimal":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Visual Chart Leaderboard */}
      <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-400" />
              Perbandingan Fuel Ratio Per Kontraktor (PT. A - PT. J)
            </h2>
            <p className="text-xs text-slate-400 mt-1">Efisiensi Konsumsi BBM (L/BCM). Semakin rendah semakin efisien.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Acuan Target: 0.25 L/BCM
          </span>
        </div>

        {/* Bar Chart Visual */}
        <div className="space-y-4">
          {filtered.map((c) => {
            // max ratio 0.40 for 100% bar width
            const percentWidth = Math.min((c.fuelRatio / 0.40) * 100, 100);
            return (
              <div
                key={c.code}
                onClick={() => onSelectContractor(c.code)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedContractor === c.code
                    ? "bg-slate-800/90 border-amber-500"
                    : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({c.code})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                    <span className="font-bold text-white font-mono text-sm">{c.fuelRatio.toFixed(2)} L/BCM</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      c.fuelRatio <= 0.22
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : c.fuelRatio <= 0.26
                        ? "bg-gradient-to-r from-cyan-500 to-cyan-400"
                        : "bg-gradient-to-r from-amber-500 to-amber-400"
                    }`}
                    style={{ width: `${percentWidth}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Breakdown Matrix */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Standar Parameter Operasi (SPO)
          </h3>

          <div className="space-y-3">
            {/* Loading */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Loading (Excavator OB)</div>
                  <div className="text-[11px] text-slate-400">Produktivitas spesifik unit</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">0.20 L/BCM</span>
            </div>

            {/* Hauling */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Hauling (Dump Truck)</div>
                  <div className="text-[11px] text-slate-400">Jarak 3.90 km (110 BCM/HR)</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">0.70 L/BCM</span>
            </div>

            {/* Supporting */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <HardHat className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Supporting (Armada Support)</div>
                  <div className="text-[11px] text-slate-400">PA 90%, UA 53%, EWH 4121 hr</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400">0.19 L/BCM</span>
            </div>

            {/* Dewatering */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Anchor className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Dewatering (Pompa Air)</div>
                  <div className="text-[11px] text-slate-400">PA 90%, UA 63%, EWH 4899 hr</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">0.18 L/BCM</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          💡 Data aktivitas diperbarui otomatis secara real-time dari registrasi armada per kontraktor.
        </div>
      </div>
    </div>
  );
};
