"use client";

import { Activity, Anchor, BarChart3, HardHat, Truck, TrendingUp } from "lucide-react";

export interface ContractorPerformance { code: string; name: string; fuelRatio: number; status: "Terendah" | "Tertinggi" | "Tersedia"; }
export interface ActivityBreakdown { activity: "Loading" | "Hauling" | "Supporting" | "Dewatering"; fuelRatio: number | null; recordCount: number; }
interface Props { contractors: ContractorPerformance[]; selectedContractor: string; onSelectContractor: (code: string) => void; activityBreakdown: ActivityBreakdown[]; }

const appearance = {
  Loading: [Activity, "text-amber-400", "from-amber-500 to-amber-300", "bg-amber-500/10"],
  Hauling: [Truck, "text-cyan-400", "from-cyan-500 to-cyan-300", "bg-cyan-500/10"],
  Supporting: [HardHat, "text-purple-400", "from-purple-500 to-purple-300", "bg-purple-500/10"],
  Dewatering: [Anchor, "text-emerald-400", "from-emerald-500 to-emerald-300", "bg-emerald-500/10"],
} as const;

export function ContractorLeaderboardChart({ contractors, selectedContractor, onSelectContractor, activityBreakdown }: Props) {
  const maximum = Math.max(...contractors.map((item) => item.fuelRatio), 0.001);
  const activityMaximum = Math.max(...activityBreakdown.map((item) => item.fuelRatio ?? 0), 0.001);
  const visible = selectedContractor === "ALL" ? contractors : contractors.filter((item) => item.code === selectedContractor);
  const statusClass = (status: ContractorPerformance["status"]) => status === "Terendah" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : status === "Tertinggi" ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";

  return <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-lg font-bold text-white"><BarChart3 className="h-5 w-5 text-amber-400" />Perbandingan Fuel Ratio per Kontraktor</h2><p className="mt-1 text-xs text-slate-400">Urutan rendah ke tinggi dari summary yang tersedia.</p></div><button onClick={() => onSelectContractor("ALL")} className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-300 hover:text-white">Tampilkan semua</button></div>
      <div className="space-y-3">{visible.length ? visible.map((item) => <button key={item.code} onClick={() => onSelectContractor(item.code)} className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedContractor === item.code ? "border-amber-500 bg-slate-800/90" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="font-bold text-white">{item.name} <span className="font-mono text-slate-500">({item.code})</span></span><span className="flex items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(item.status)}`}>{item.status}</span><strong className="font-mono text-white">{item.fuelRatio.toFixed(3)} L/BCM</strong></span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-950"><div className={`h-full rounded-full ${item.status === "Tertinggi" ? "bg-rose-400" : item.status === "Terendah" ? "bg-emerald-400" : "bg-cyan-400"}`} style={{ width: `${(item.fuelRatio / maximum) * 100}%` }} /></div></button>) : <p className="py-8 text-center text-xs text-slate-500">Belum ada summary Fuel Ratio.</p>}</div>
    </div>
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
      <div className="mb-6"><h3 className="flex items-center gap-2 text-base font-bold text-white"><TrendingUp className="h-5 w-5 text-emerald-400" />Breakdown Aktivitas</h3><p className="mt-1 text-xs text-slate-400">Perbandingan rata-rata Fuel Ratio tiap aktivitas.</p></div>
      <div className="mb-5 flex justify-between border-b border-slate-800 pb-2 text-[10px] uppercase tracking-wider text-slate-500"><span>Aktivitas</span><span>Fuel Ratio (L/BCM)</span></div>
      <div className="space-y-5">{activityBreakdown.map((item) => { const [Icon, color, gradient, background] = appearance[item.activity]; const width = item.fuelRatio === null ? 0 : Math.max((item.fuelRatio / activityMaximum) * 100, 3); return <div key={item.activity}><div className="mb-2 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={`rounded-lg p-1.5 ${background} ${color}`}><Icon className="h-3.5 w-3.5" /></span><span><b className="block text-xs text-white">{item.activity}</b><small className="text-[10px] text-slate-500">{item.recordCount} summary tersedia</small></span></div><strong className={`shrink-0 font-mono text-xs ${color}`}>{item.fuelRatio === null ? "—" : item.fuelRatio.toFixed(3)}</strong></div><div className="h-3 overflow-hidden rounded-full border border-slate-800 bg-slate-950/80" role="progressbar" aria-label={`Fuel Ratio ${item.activity}`} aria-valuemin={0} aria-valuemax={activityMaximum} aria-valuenow={item.fuelRatio ?? 0}><div className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-[0_0_12px_rgba(255,255,255,0.12)] transition-all duration-500`} style={{ width: `${width}%` }} /></div></div>; })}</div>
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] leading-relaxed text-slate-500">Panjang bar menunjukkan perbandingan relatif dalam filter aktif. Target SPO belum tersedia dari API.</div>
    </aside>
  </section>;
}
