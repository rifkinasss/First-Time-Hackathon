"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw, ShieldAlert, X } from "lucide-react";
import { fetchContractorFuzzyRisk, fetchContractorPerformances } from "@/lib/api";
import type { ContractorFuzzyRisk, ContractorPerformance } from "@/types/api";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataTablePagination, DataTableSearch, SortableHeader, type SortDirection } from "@/components/ui/data-table";

const number = (value: number, digits = 2) => value.toLocaleString("id-ID", { maximumFractionDigits: digits });
type PerformanceSortKey = "code" | "actual_fuel_ratio" | "fuel_ratio_variance_pct" | "actual_productivity" | "performance_status";
const pageSize = 10;

function explainRule(rule: string) {
  const normalized = rule.toLowerCase();
  if (normalized.includes("productivity") && normalized.includes("fuel ratio")) {
    return "Produktivitas yang turun membuat volume BCM pembagi menjadi lebih kecil, sementara konsumsi fuel dan jam kerja tetap berjalan. Akibatnya Fuel Ratio per BCM meningkat. Prioritaskan pemulihan produktivitas unit, kurangi waktu idle, lalu evaluasi ulang alokasi armada.";
  }
  return "Aturan ini menunjukkan hubungan antara kondisi operasi dan deviasi Fuel Ratio. Tinjau variabel yang disebutkan pada aturan, validasi data unit, kemudian lakukan penyesuaian operasi pada faktor yang menyebabkan deviasi.";
}

export function ContractorPerformanceClient() {
  const [rows, setRows] = useState<ContractorPerformance[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [risk, setRisk] = useState<ContractorFuzzyRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<PerformanceSortKey>("fuel_ratio_variance_pct");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchContractorPerformances();
      setRows(result);
      setSelectedId((current) => current && result.some((row) => row.contractor_id === current) ? current : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kinerja kontraktor tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!selectedId) return;
    let live = true;
    const timer = window.setTimeout(() => {
      setRiskLoading(true);
      void fetchContractorFuzzyRisk(selectedId)
        .then((data) => { if (live) setRisk(data); })
        .catch(() => { if (live) setRisk(null); })
        .finally(() => { if (live) setRiskLoading(false); });
    }, 0);
    return () => { live = false; window.clearTimeout(timer); };
  }, [selectedId]);

  const selected = rows.find((row) => row.contractor_id === selectedId) ?? null;
  const closeDetail = () => { setSelectedId(null); setRisk(null); };
  const filteredRows = useMemo(() => rows.filter((row) => `${row.code} ${row.company_name} ${row.performance_status}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => { const first = a[sortKey]; const second = b[sortKey]; const result = typeof first === "number" && typeof second === "number" ? first - second : String(first).localeCompare(String(second), "id", { numeric: true }); return result * (sortDirection === "asc" ? 1 : -1); }), [query, rows, sortDirection, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((Math.min(page, pageCount) - 1) * pageSize, Math.min(page, pageCount) * pageSize);
  const toggleSort = (key: PerformanceSortKey) => { setSortDirection((current) => sortKey === key && current === "asc" ? "desc" : "asc"); setSortKey(key); setPage(1); };
  const header = (label: string, key: PerformanceSortKey, align: "left" | "right" = "left") => <SortableHeader label={label} align={align} active={sortKey === key} direction={sortDirection} onClick={() => toggleSort(key)} />;

  return <DashboardShell activeFeature={9}>
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Analitik Kontraktor</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Kinerja &amp; Risiko Kontraktor</h2><p className="mt-1 text-sm text-slate-500">Bandingkan realisasi Fuel Ratio, produktivitas, dan evaluasi fuzzy setiap kontraktor.</p></div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700 disabled:opacity-50"><RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />Perbarui</button>
      </section>

      {loading ? <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div> : error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error}</div> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h3 className="font-bold text-slate-950">Perbandingan Kontraktor</h3><p className="mt-1 text-xs text-slate-500">Gunakan tombol detail untuk membuka rincian dalam pop-up.</p></div><DataTableSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Cari kontraktor atau status..." /></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-xs"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">{header("Kontraktor", "code")}</th><th className="px-5 py-3 text-right">{header("FR aktual / SPO", "actual_fuel_ratio", "right")}</th><th className="px-5 py-3 text-right">{header("Deviasi FR", "fuel_ratio_variance_pct", "right")}</th><th className="px-5 py-3 text-right">{header("Produktivitas", "actual_productivity", "right")}</th><th className="px-5 py-3">{header("Status", "performance_status")}</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((row) => <tr key={row.contractor_id} className="transition hover:bg-violet-50"><td className="px-5 py-4"><p className="font-bold text-slate-800">{row.code}</p><p className="mt-1 text-[10px] text-slate-400">{row.company_name}</p></td><td className="px-5 py-4 text-right font-mono font-bold text-slate-800">{number(row.actual_fuel_ratio, 3)} / {number(row.target_fuel_ratio, 3)}</td><td className={`px-5 py-4 text-right font-mono font-bold ${row.fuel_ratio_variance_pct > 0 ? "text-rose-600" : "text-emerald-600"}`}>{row.fuel_ratio_variance_pct > 0 ? "+" : ""}{number(row.fuel_ratio_variance_pct)}%</td><td className="px-5 py-4 text-right font-mono text-slate-700">{number(row.actual_productivity)} BCM/hr</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${row.performance_status.includes("UNDER") || row.performance_status.includes("INEFFICIENT") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{row.performance_status.replaceAll("_", " ")}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setSelectedId(row.contractor_id)} className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-[11px] font-bold text-violet-700 transition hover:border-violet-400 hover:bg-violet-50">Lihat detail</button></td></tr>)}</tbody></table>{filteredRows.length === 0 && <p className="p-10 text-center text-sm text-slate-400">Belum ada kontraktor yang sesuai pencarian.</p>}</div><DataTablePagination page={page} pageCount={pageCount} total={filteredRows.length} pageSize={pageSize} onPageChange={setPage} />
      </section>}

      {selected && <div className="fixed inset-y-0 right-0 z-40 flex items-center justify-center p-4 sm:p-6 lg:left-72">
        <button type="button" aria-label="Tutup detail kontraktor" onClick={closeDetail} className="absolute inset-0 cursor-default bg-transparent backdrop-blur-sm" />
        <section role="dialog" aria-modal="true" aria-labelledby="contractor-detail-title" className="relative z-10 max-h-full w-full max-w-[1100px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-2xl sm:p-6">
          <button type="button" aria-label="Tutup pop-up detail" onClick={closeDetail} className="absolute right-5 top-5 z-10 inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"><X className="size-4" /></button>
          <div className="pr-12"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">Detail kontraktor</p><h3 id="contractor-detail-title" className="mt-1 text-xl font-bold text-slate-950">{selected.code} · {selected.company_name}</h3><p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">{selected.insight}</p></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">{[{ label: "Fuel aktual", value: `${number(selected.actual_fuel_cons)} L` }, { label: "FR aktual / SPO", value: `${number(selected.actual_fuel_ratio, 3)} / ${number(selected.target_fuel_ratio, 3)}` }, { label: "Unit support + dewatering", value: String(selected.support_dewatering_population) }, { label: "Fuel support", value: `${number(selected.support_dewatering_fuel_share_pct)}%` }].map((item) => <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p><p className="mt-1 font-mono text-sm font-bold text-slate-800">{item.value}</p></div>)}</div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]"><div className="space-y-5"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/85"><div className="border-b border-slate-100 p-4"><h4 className="font-bold text-slate-950">Rincian per Aktivitas</h4></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-xs"><thead className="bg-slate-50/90 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3 text-left">Aktivitas</th><th className="px-4 py-3 text-right">FR / SPO</th><th className="px-4 py-3 text-right">Fuel</th><th className="px-4 py-3 text-right">Unit</th></tr></thead><tbody className="divide-y divide-slate-100">{selected.activity_breakdowns.map((item) => <tr key={item.activity}><td className="px-4 py-3.5 font-semibold capitalize text-slate-800">{item.label}</td><td className="px-4 py-3.5 text-right font-mono">{number(item.actual_fuel_ratio, 3)} / {number(item.target_fuel_ratio, 3)}</td><td className="px-4 py-3.5 text-right font-mono">{number(item.actual_fuel_cons)} L</td><td className="px-4 py-3.5 text-right font-mono">{item.equipment_count}</td></tr>)}</tbody></table></div></section><section className="rounded-xl border border-violet-200 bg-violet-50/75 p-4 text-xs text-violet-950"><p className="font-bold">Interpretasi aturan operasional</p><p className="mt-1 font-mono text-[10px] font-semibold text-violet-700">{selected.rule_applied}</p><p className="mt-3 leading-relaxed text-violet-900">{explainRule(selected.rule_applied)}</p></section></div>
            <aside className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-3"><span className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><ShieldAlert className="size-5" /></span><div><h4 className="font-bold text-slate-950">Risiko fuzzy</h4><p className="mt-1 text-xs text-slate-500">Evaluasi Mamdani untuk kontraktor ini.</p></div></div>{riskLoading ? <div className="flex h-36 items-center justify-center"><LoaderCircle className="size-5 animate-spin text-amber-600" /></div> : risk ? <div className="mt-5 space-y-4"><div className={`rounded-xl p-4 ${risk.risk_level === "HIGH" ? "bg-rose-50 text-rose-800" : risk.risk_level === "NORMAL" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}><p className="text-[10px] font-bold uppercase tracking-wider">Level risiko</p><p className="mt-1 text-xl font-bold">{risk.risk_level} · {number(risk.risk_score, 2)}</p></div><p className="text-xs leading-relaxed text-slate-600">{risk.dominant_rules}</p><div className="grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">Deviasi fuel</p><p className="mt-1 font-mono font-bold">{number(risk.fuel_deviation_ratio, 2)}x</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-slate-400">Fuel support</p><p className="mt-1 font-mono font-bold">{number(risk.support_dewatering_fuel_share_pct)}%</p></div></div></div> : <p className="mt-5 text-xs text-slate-400">Risiko fuzzy belum tersedia untuk kontraktor ini.</p>}</aside>
          </div>
        </section>
      </div>}
    </div>
  </DashboardShell>;
}
