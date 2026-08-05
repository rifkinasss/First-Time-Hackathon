"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, CircleDollarSign, Fuel, LoaderCircle, RefreshCw, Target, TriangleAlert } from "lucide-react";
import { fetchSPOAlignment, simulateSPOAlignment } from "@/lib/api";
import type { AlignmentCategoryBreakdown, ReconciliationActionItem, SPOAlignment as SPOAlignmentData } from "@/types/api";

const formatNumber = (value: number, maximumFractionDigits = 0) => value.toLocaleString("id-ID", { maximumFractionDigits });
const formatCurrency = (value: number) => value.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const statusStyle = {
  ALIGNED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OVER_CONSUMPTION: "border-rose-200 bg-rose-50 text-rose-700",
  EFFICIENT: "border-cyan-200 bg-cyan-50 text-cyan-700",
  OVER_BUDGET: "border-rose-200 bg-rose-50 text-rose-700",
};

function CategoryTable({ rows }: { rows: AlignmentCategoryBreakdown[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Aktivitas</th><th className="px-5 py-3 text-right">Fuel Aktual</th><th className="px-5 py-3 text-right">Target SPO</th><th className="px-5 py-3 text-right">Variance</th><th className="px-5 py-3 text-right">Actual FR</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.activity} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold capitalize text-slate-800">{row.activity}</td><td className="px-5 py-4 text-right font-mono text-slate-700">{formatNumber(row.actual_fuel_liters)} L</td><td className="px-5 py-4 text-right font-mono text-slate-600">{formatNumber(row.target_spo_fuel_liters)} L</td><td className={`px-5 py-4 text-right font-mono font-bold ${row.fuel_variance_liters > 0 ? "text-rose-600" : "text-emerald-600"}`}>{row.fuel_variance_liters > 0 ? "+" : ""}{formatNumber(row.fuel_variance_liters)} L</td><td className="px-5 py-4 text-right font-mono font-bold text-slate-800">{row.actual_fuel_ratio.toFixed(3)}</td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle[row.status]}`}>{row.status.replaceAll("_", " ")}</span></td></tr>)}</tbody></table>{rows.length === 0 && <div className="p-10 text-center text-sm text-slate-400">Belum ada breakdown aktivitas.</div>}</div>;
}

function ActionList({ actions }: { actions: ReconciliationActionItem[] }) {
  const priorityStyle = { HIGH: "border-rose-200 bg-rose-50", MEDIUM: "border-amber-200 bg-amber-50", LOW: "border-emerald-200 bg-emerald-50" };
  return <div className="space-y-3">{actions.map((action, index) => <div key={`${action.category}-${index}`} className={`rounded-xl border p-4 ${priorityStyle[action.priority]}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-900">{action.title}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-600">{action.description}</p></div><span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-[9px] font-bold text-slate-600">{action.priority}</span></div></div>)}</div>;
}

function SimulationPanel({ source }: { source: SPOAlignmentData }) {
  const [form, setForm] = useState({ actualFuel: String(source.actual_total_fuel_liters), actualProduction: String(source.actual_production_bcm), targetFr: String(source.target_spo_fuel_ratio), targetProduction: String(source.target_production_bcm), fuelPrice: "15000" });
  const [result, setResult] = useState<SPOAlignmentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); setError(null); try { const data = await simulateSPOAlignment({ actual_fuel_cons_liters: Number(form.actualFuel), actual_production_bcm: Number(form.actualProduction), target_spo_fuel_ratio: Number(form.targetFr), target_production_bcm: Number(form.targetProduction), fuel_price_per_liter: Number(form.fuelPrice) }); setResult(data); } catch (cause) { setError(cause instanceof Error ? cause.message : "Simulasi tidak dapat diproses."); } finally { setSaving(false); } };
  const field = (key: keyof typeof form, label: string, helper?: string) => <label className="block"><span className="text-xs font-semibold text-slate-700">{label}</span><input required min="0.0001" step="any" type="number" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10" />{helper && <span className="mt-1 block text-[10px] text-slate-400">{helper}</span>}</label>;
  const display = result ?? source;
  const isSaving = display.cost_impact_idr < 0;
  return <section className="grid gap-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] sm:p-6"><form onSubmit={submit}><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-100 p-2.5 text-violet-700"><Target className="size-5" /></span><div><h3 className="font-bold text-slate-950">Simulasi SPO</h3><p className="mt-1 text-xs text-slate-500">Uji skenario fuel, produksi, target FR, dan harga tanpa mengubah transaksi operasional.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{field("actualFuel", "Fuel aktual (liter)")}{field("actualProduction", "Produksi aktual (BCM)")}{field("targetFr", "Target Fuel Ratio SPO (L/BCM)")}{field("targetProduction", "Target produksi (BCM)")}{field("fuelPrice", "Harga fuel (IDR/liter)")}</div><button type="submit" disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">{saving ? <LoaderCircle className="size-3.5 animate-spin" /> : <BarChart3 className="size-3.5" />}Jalankan simulasi</button>{error && <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p>}</form><aside className="rounded-2xl border border-violet-100 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">{result ? "Hasil simulasi" : "Baseline saat ini"}</p><p className={`mt-3 text-lg font-bold ${display.alignment_status === "OVER_BUDGET" ? "text-rose-700" : "text-emerald-700"}`}>{display.alignment_status.replaceAll("_", " ")}</p><div className="mt-5 space-y-3 text-xs"><div className="flex justify-between gap-3"><span className="text-slate-500">Fuel Ratio</span><strong className="font-mono text-slate-800">{display.actual_fuel_ratio.toFixed(3)} / {display.target_spo_fuel_ratio.toFixed(3)}</strong></div><div className="flex justify-between gap-3"><span className="text-slate-500">{display.fuel_variance_liters < 0 ? "Penghematan fuel" : "Kelebihan fuel"}</span><strong className={`font-mono ${display.fuel_variance_liters > 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatNumber(Math.abs(display.fuel_variance_liters))} L</strong></div><div className="flex justify-between gap-3"><span className="text-slate-500">{isSaving ? "Estimasi penghematan" : "Dampak biaya"}</span><strong className={`font-mono ${isSaving ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(Math.abs(display.cost_impact_idr))}</strong></div><div className="flex justify-between gap-3"><span className="text-slate-500">Gap produksi</span><strong className="font-mono text-slate-800">{formatNumber(display.production_gap_bcm)} BCM</strong></div></div></aside></section>;
}

export function SPOAlignment() {
  const [data, setData] = useState<SPOAlignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchSPOAlignment());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analisis SPO tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) return <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white"><LoaderCircle className="size-7 animate-spin text-amber-500" /></div>;
  if (error || !data) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><AlertTriangle className="mx-auto size-7 text-rose-500" /><h2 className="mt-3 font-bold text-rose-900">Analisis SPO tidak tersedia</h2><p className="mt-1 text-sm text-rose-700">{error}</p><button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white"><RefreshCw className="size-3.5" />Coba lagi</button></div>;

  const overBudget = data.alignment_status === "OVER_BUDGET";
  const isSaving = data.cost_impact_idr < 0;
  const productionProgress = data.target_production_bcm > 0 ? Math.min(100, (data.actual_production_bcm / data.target_production_bcm) * 100) : 0;
  const fuelProgress = data.target_spo_fuel_liters > 0 ? Math.min(100, (data.actual_total_fuel_liters / data.target_spo_fuel_liters) * 100) : 0;
  const cards = [
    { label: "Fuel Aktual", value: `${formatNumber(data.actual_total_fuel_liters)} L`, helper: `Target SPO ${formatNumber(data.target_spo_fuel_liters)} L`, icon: Fuel, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Fuel Ratio Aktual", value: `${data.actual_fuel_ratio.toFixed(3)} L/BCM`, helper: `SPO ${data.target_spo_fuel_ratio.toFixed(3)} L/BCM`, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
    { label: isSaving ? "Estimasi Penghematan" : "Dampak Biaya", value: formatCurrency(Math.abs(data.cost_impact_idr)), helper: isSaving ? `${formatNumber(Math.abs(data.fuel_variance_liters))} L di bawah target SPO` : `${data.fuel_variance_pct.toFixed(1)}% di atas target SPO`, icon: CircleDollarSign, color: isSaving ? "text-emerald-600" : "text-rose-600", bg: isSaving ? "bg-emerald-50" : "bg-rose-50" },
    { label: "Gap Produksi", value: `${formatNumber(Math.abs(data.production_gap_bcm))} BCM`, helper: `Target ${formatNumber(data.target_production_bcm)} BCM`, icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return <div className="space-y-6"><section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Fitur 03 · Alignment</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">SPO &amp; Target Produksi</h2><p className="mt-1 text-sm text-slate-500">Selaraskan konsumsi fuel aktual, standar operasi, dan target produksi.</p></div><button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700"><RefreshCw className="size-3.5" />Perbarui analisis</button></section>
    <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status penyelarasan · {data.period}</p><div className="mt-2 flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-xl ${overBudget ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>{overBudget ? <TriangleAlert className="size-5" /> : <CheckCircle2 className="size-5" />}</span><div><h3 className="text-lg font-bold text-slate-950">{data.alignment_status.replaceAll("_", " ")}</h3><p className="text-xs text-slate-500">{overBudget ? "Pemakaian fuel berada di atas acuan SPO." : "Pemakaian fuel masih berada dalam kondisi efisien."}</p></div></div></div><div className="max-w-sm text-left text-xs leading-relaxed text-slate-500 sm:text-right">Evaluasi ini membantu menentukan apakah deviasi berasal dari konsumsi berlebih, gap produksi, atau kebutuhan optimasi armada.</div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p><p className="mt-3 text-xl font-bold tracking-tight text-slate-950">{card.value}</p></div><span className={`rounded-xl p-2.5 ${card.bg} ${card.color}`}><Icon className="size-5" /></span></div><p className="mt-2 text-xs text-slate-500">{card.helper}</p></div>; })}</section>
    <section className="grid gap-6 xl:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-base font-bold text-slate-950">Realisasi Produksi</h3><p className="mt-1 text-xs text-slate-500">Actual dibandingkan target rencana produksi.</p></div><span className="font-mono text-sm font-bold text-slate-800">{productionProgress.toFixed(1)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${productionProgress}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>Actual {formatNumber(data.actual_production_bcm)} BCM</span><span>Target {formatNumber(data.target_production_bcm)} BCM</span></div><div className="mt-5 rounded-xl bg-violet-50 p-3 text-xs text-violet-800">Produksi yang dibutuhkan agar Fuel Ratio sesuai SPO: <strong>{formatNumber(data.required_production_for_target_fr)} BCM</strong>.</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-base font-bold text-slate-950">Konsumsi Fuel terhadap SPO</h3><p className="mt-1 text-xs text-slate-500">Actual dibandingkan konsumsi yang seharusnya.</p></div><span className={`font-mono text-sm font-bold ${fuelProgress > 100 ? "text-rose-600" : "text-emerald-600"}`}>{fuelProgress.toFixed(1)}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${fuelProgress > 100 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${fuelProgress}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>Actual {formatNumber(data.actual_total_fuel_liters)} L</span><span>SPO {formatNumber(data.target_spo_fuel_liters)} L</span></div><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-700">{data.fuel_variance_liters > 0 ? <ArrowUpRight className="size-4 text-rose-500" /> : <ArrowDownRight className="size-4 text-emerald-500" />}{data.fuel_variance_liters > 0 ? "Kelebihan" : "Penghematan"} {formatNumber(Math.abs(data.fuel_variance_liters))} liter</div></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5 sm:p-6"><h3 className="text-base font-bold text-slate-950">Alignment per Aktivitas</h3><p className="mt-1 text-xs text-slate-500">Perbandingan konsumsi aktual setiap aktivitas dengan standar SPO.</p></div><CategoryTable rows={data.category_breakdowns} /></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h3 className="text-base font-bold text-slate-950">Rekomendasi Penyelarasan</h3><p className="mt-1 text-xs text-slate-500">Aksi operasional berdasarkan hasil evaluasi deviasi fuel dan produksi.</p></div><ActionList actions={data.reconciliation_actions} /></section>
    <SimulationPanel source={data} />
  </div>;
}
