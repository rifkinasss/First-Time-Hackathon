"use client";

import React, { useState } from "react";
import { Building2, Eye, ShieldCheck, X } from "lucide-react";

export interface ContractorDetailRow {
  id: number;
  code: string;
  name: string;
  status: string;
  totalEquipment: number;
  loadingCount: number;
  haulingCount: number;
  supportingCount: number;
  dewateringCount: number;
  fuelConsLiters: number;
  totalBcmProd: number;
  fuelRatio: number;
}

interface DetailTableProps {
  data: ContractorDetailRow[];
  selectedContractor: string;
  onSelectContractor: (code: string) => void;
}

export const ContractorDetailTable: React.FC<DetailTableProps> = ({
  data,
  selectedContractor,
  onSelectContractor,
}) => {
  const [activeModalRow, setActiveModalRow] = useState<ContractorDetailRow | null>(null);

  const filtered = selectedContractor === "ALL"
    ? data
    : data.filter((item) => item.code === selectedContractor);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-400" />
            Matriks Performa Kontraktor (Multi Contractor Breakdown)
          </h2>
          <p className="text-xs text-slate-400 mt-1">Daftar kontraktor PT. A s/d PT. J beserta armada operasional dan Fuel Ratio.</p>
        </div>

        {/* Filter Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Filter Aktif:</span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold font-mono">
            {selectedContractor === "ALL" ? "All 10 Contractors" : selectedContractor}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Kontraktor</th>
              <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-center">Total Armada</th>
              <th className="py-3.5 px-4 font-semibold text-center">Loading</th>
              <th className="py-3.5 px-4 font-semibold text-center">Hauling</th>
              <th className="py-3.5 px-4 font-semibold text-center">Supporting</th>
              <th className="py-3.5 px-4 font-semibold text-center">Dewatering</th>
              <th className="py-3.5 px-4 font-semibold text-right">Fuel Cons (Liter)</th>
              <th className="py-3.5 px-4 font-semibold text-right">Fuel Ratio</th>
              <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.map((row) => (
              <tr
                key={row.code}
                className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                onClick={() => onSelectContractor(row.code)}
              >
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-xs">
                    {row.code.replace("PT", "")}
                  </div>
                  <div>
                    <div>{row.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.code}</div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                    <ShieldCheck className="h-3 w-3" /> Active
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-white font-mono">{row.totalEquipment} Unit</td>
                <td className="py-3.5 px-4 text-center font-mono text-amber-400 font-semibold">{row.loadingCount}</td>
                <td className="py-3.5 px-4 text-center font-mono text-cyan-400 font-semibold">{row.haulingCount}</td>
                <td className="py-3.5 px-4 text-center font-mono text-purple-400 font-semibold">{row.supportingCount}</td>
                <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-semibold">{row.dewateringCount}</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                  {row.fuelConsLiters.toLocaleString()} L
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                  {row.fuelRatio.toFixed(2)} L/BCM
                </td>
                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setActiveModalRow(row)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Lihat Detail Activity"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Breakdown */}
      {activeModalRow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono font-bold text-lg">
                  {activeModalRow.code}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeModalRow.name}</h3>
                  <p className="text-xs text-slate-400">Detail Performa & Breakdown Armada Operasional</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalRow(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Total Solar Terkonsumsi</span>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {activeModalRow.fuelConsLiters.toLocaleString()} Liter
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Overall Fuel Ratio Kontraktor</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                    {activeModalRow.fuelRatio.toFixed(2)} L/BCM
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-300">Rincian Armada & Modul Status</h4>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-400">Loading (Excavator OB)</div>
                    <div className="text-slate-400">{activeModalRow.loadingCount} Unit Terdaftar</div>
                  </div>
                  <span className="font-mono font-bold text-white">0.20 L/BCM</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-cyan-400">Hauling (Dump Truck Jarak 3.90 km / 3900m)</div>
                    <div className="text-slate-400">{activeModalRow.haulingCount} Unit Terdaftar (110 BCM/HR)</div>
                  </div>
                  <span className="font-mono font-bold text-white">0.70 L/BCM</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-purple-400">Supporting (Armada Support)</div>
                    <div className="text-slate-400">{activeModalRow.supportingCount} Unit Terdaftar (PA 90%, UA 53%, EWH 4121hr)</div>
                  </div>
                  <span className="font-mono font-bold text-white">0.19 L/BCM</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-400">Dewatering (Pompa Air Tambang)</div>
                    <div className="text-slate-400">{activeModalRow.dewateringCount} Unit Terdaftar (PA 90%, UA 63%, EWH 4899hr)</div>
                  </div>
                  <span className="font-mono font-bold text-white">0.18 L/BCM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
