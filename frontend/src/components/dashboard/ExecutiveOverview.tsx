"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Building2, Fuel, Gauge, LoaderCircle, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { fetchContractorFuzzyRisks, fetchMonitoringOverview } from "@/lib/api";
import type { ContractorFuzzyRisk, MonitoringOverview } from "@/types/api";
import { DataTablePagination, DataTableSearch, SortableHeader, type SortDirection } from "@/components/ui/data-table";

const riskStyle = {
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
  NORMAL: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const formatNumber = (value: number, maximumFractionDigits = 0) => value.toLocaleString("id-ID", { maximumFractionDigits });
type RiskSortKey = "company_name" | "risk_score" | "fuel_deviation_ratio" | "support_dewatering_population" | "risk_level";
const riskPageSize = 5;

function explainDominantRules(rules: string) {
  const normalized = rules.toLowerCase();
  const reasons: string[] = [];

  if (normalized.includes("r4_low_productivity_high_population")) reasons.push("Produktivitas rendah dan populasi unit tinggi membuat fuel tidak sebanding dengan output BCM.");
  if (normalized.includes("r5_low_productivity_high_fuel")) reasons.push("Produktivitas rendah bersamaan dengan pemakaian fuel tinggi menaikkan Fuel Ratio.");
  if (normalized.includes("r3_fuel_up")) reasons.push("Konsumsi fuel berada di atas rentang normal sehingga perlu ditelusuri sumber deviasinya.");
  if (normalized.includes("r2_population_up")) reasons.push("Jumlah unit pendukung/dewatering relatif tinggi; utilisasinya perlu dievaluasi.");
  if (normalized.includes("r1_productivity_up")) reasons.push("Produktivitas berada di atas baseline dan sedang dipantau terhadap perubahan efisiensi.");
  if (normalized.includes("r7_optimal_operation")) reasons.push("Produktivitas baik, populasi terkendali, dan konsumsi fuel rendah—kondisi operasional optimal.");
  if (normalized.includes("r6_normal_operation")) reasons.push("Produktivitas, populasi unit, dan konsumsi fuel masih berada pada rentang normal.");

  return reasons.length ? reasons.join(" ") : "Risiko dihitung dari kombinasi produktivitas, populasi unit, dan deviasi konsumsi fuel.";
}

function formatChartDate(date: string) {
  const hasTime = date.includes("T");
  const parsed = new Date(hasTime ? date : `${date}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", hasTime ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short" }).format(parsed);
}

function TrendChart({ trend }: { trend: MonitoringOverview["trend"] }) {
  const displayTrend = [...trend].sort((first, second) => first.date.localeCompare(second.date));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  if (!displayTrend.length) return <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-sm text-slate-400">Belum ada data transaksi untuk ditampilkan pada tren.</div>;
  const width = 760;
  const height = 250;
  const padX = 34;
  const padY = 24;
  const values = displayTrend.flatMap((point) => [point.actualFR, point.spoFR]);
  const max = Math.max(...values, 0.1) * 1.15;
  const point = (value: number, index: number) => `${displayTrend.length === 1 ? width / 2 : padX + (index / (displayTrend.length - 1)) * (width - padX * 2)},${height - padY - (value / max) * (height - padY * 2)}`;
  const spoPoints = displayTrend.map((item, index) => point(item.spoFR, index)).join(" ");
  const actualPoints = displayTrend.map((item, index) => point(item.actualFR, index)).join(" ");
  const hoveredPoint = hoveredIndex === null ? null : displayTrend[hoveredIndex];
  const hoveredX = hoveredIndex === null ? 50 : (displayTrend.length === 1 ? 50 : (hoveredIndex / (displayTrend.length - 1)) * 100);
  const hoveredY = hoveredPoint ? ((height - padY - (hoveredPoint.actualFR / max) * (height - padY * 2)) / height) * 100 : 50;
  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-500" />Data aktual</span>
        <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-slate-300" />Target SPO</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full cursor-crosshair" role="img" aria-label="Tren rasio bahan bakar aktual dan target SPO" onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const relativeX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
          setHoveredIndex(Math.round(relativeX * (displayTrend.length - 1)));
        }} onMouseLeave={() => setHoveredIndex(null)}>
          {[0, 0.5, 1].map((ratio) => {
            const y = height - padY - ratio * (height - padY * 2);
            return <line key={ratio} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 5" />;
          })}
          <polyline points={spoPoints} fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" />
          <polyline points={actualPoints} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {displayTrend.map((item, index) => <circle key={`${item.date}-${index}`} cx={Number(point(item.actualFR, index).split(",")[0])} cy={Number(point(item.actualFR, index).split(",")[1])} r="4" fill="#fff" stroke="#f59e0b" strokeWidth="3" />)}
          {hoveredPoint && <><line x1={Number(point(hoveredPoint.actualFR, hoveredIndex ?? 0).split(",")[0])} x2={Number(point(hoveredPoint.actualFR, hoveredIndex ?? 0).split(",")[0])} y1={padY} y2={height - padY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" /><circle cx={Number(point(hoveredPoint.actualFR, hoveredIndex ?? 0).split(",")[0])} cy={Number(point(hoveredPoint.actualFR, hoveredIndex ?? 0).split(",")[1])} r="6" fill="#fff" stroke="#ea580c" strokeWidth="3" /></>}
        </svg>
        {hoveredPoint && <div className="pointer-events-none absolute z-10 w-48 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur" style={{ left: `${Math.min(76, Math.max(2, hoveredX - 10))}%`, top: `${Math.min(66, Math.max(4, hoveredY - 4))}%` }}><p className="font-bold text-slate-900">{formatChartDate(hoveredPoint.date)}</p><div className="mt-2 space-y-1.5 text-slate-600"><p className="flex justify-between gap-3"><span>Rasio aktual</span><strong className="font-mono text-amber-700">{hoveredPoint.actualFR.toFixed(3)}</strong></p><p className="flex justify-between gap-3"><span>Target SPO</span><strong className="font-mono text-slate-700">{hoveredPoint.spoFR.toFixed(3)}</strong></p><p className="flex justify-between gap-3"><span>Bahan bakar</span><strong className="font-mono text-slate-700">{formatNumber(hoveredPoint.fuelConsumption)} L</strong></p><p className="flex justify-between gap-3"><span>Produksi</span><strong className="font-mono text-slate-700">{formatNumber(hoveredPoint.production)} BCM</strong></p></div></div>}
      </div>
      <div className="mt-2 flex justify-between px-3 text-[10px] text-slate-400"><span>{formatChartDate(displayTrend[0].date)}</span><span>{formatChartDate(displayTrend[displayTrend.length - 1].date)}</span></div>
    </div>
  );
}

const activityColors = ["#2563eb", "#06b6d4", "#8b5cf6", "#10b981"];

function FuelCompositionDonut({ activities, totalFuel }: { activities: MonitoringOverview["activities"]; totalFuel: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rows = activities.filter((item) => item.fuelConsumption > 0);
  if (!rows.length || totalFuel <= 0) return <div className="flex h-64 items-center justify-center text-sm text-slate-400">Belum ada konsumsi fuel per aktivitas.</div>;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const segments = rows.map((item, index) => {
    const percentage = item.fuelConsumption / totalFuel;
    const length = percentage * circumference;
    const priorLength = rows.slice(0, index).reduce((sum, previous) => sum + (previous.fuelConsumption / totalFuel) * circumference, 0);
    return { ...item, percentage, color: activityColors[index % activityColors.length], dasharray: `${length} ${circumference - length}`, dashoffset: -priorLength };
  });
  const hoveredActivity = hoveredIndex === null ? null : segments[hoveredIndex];
  return <div className="grid gap-5 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center" onMouseLeave={() => setHoveredIndex(null)}><div className="relative mx-auto size-48"><svg viewBox="0 0 160 160" className="size-full -rotate-90" role="img" aria-label="Komposisi konsumsi bahan bakar per aktivitas"><circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" />{segments.map((item, index) => <circle key={item.activity} cx="80" cy="80" r={radius} fill="none" stroke={item.color} strokeWidth={hoveredIndex === index ? 23 : 18} strokeLinecap="butt" strokeDasharray={item.dasharray} strokeDashoffset={item.dashoffset} className="cursor-pointer transition-all" onMouseEnter={() => setHoveredIndex(index)} />)}</svg><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bahan Bakar</span><strong className="mt-1 font-mono text-lg text-slate-900">{formatNumber(totalFuel)}</strong><span className="text-[10px] text-slate-500">liter</span></div>{hoveredActivity && <div role="tooltip" className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-52 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: hoveredActivity.color }} /><p className="font-bold text-slate-900">{hoveredActivity.label}</p></div><div className="mt-2 space-y-1.5 text-slate-600"><p className="flex justify-between gap-3"><span>Konsumsi</span><strong className="font-mono text-slate-800">{formatNumber(hoveredActivity.fuelConsumption)} L</strong></p><p className="flex justify-between gap-3"><span>Kontribusi</span><strong className="font-mono text-slate-800">{(hoveredActivity.percentage * 100).toFixed(1)}%</strong></p><p className="flex justify-between gap-3"><span>Rasio bahan bakar</span><strong className="font-mono text-slate-800">{hoveredActivity.actualFR.toFixed(3)}</strong></p></div></div>}</div><div className="space-y-3">{segments.map((item, index) => <div key={item.activity} onMouseEnter={() => setHoveredIndex(index)} className={`flex cursor-default items-center justify-between gap-3 rounded-lg px-2 py-1 transition ${hoveredIndex === index ? "bg-slate-50" : ""}`}><div className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{item.label}</p><p className="text-[10px] text-slate-500">{formatNumber(item.fuelConsumption)} L</p></div></div><span className="font-mono text-xs font-bold text-slate-700">{(item.percentage * 100).toFixed(1)}%</span></div>)}</div></div>;
}

export function ExecutiveOverview() {
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [risks, setRisks] = useState<ContractorFuzzyRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [riskQuery, setRiskQuery] = useState("");
  const [riskSortKey, setRiskSortKey] = useState<RiskSortKey>("risk_score");
  const [riskSortDirection, setRiskSortDirection] = useState<SortDirection>("desc");
  const [riskPage, setRiskPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, riskData] = await Promise.all([fetchMonitoringOverview(), fetchContractorFuzzyRisks()]);
      setOverview(overviewData);
      setRisks(riskData);
      setLastUpdated(new Date());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Overview tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const riskCount = useMemo(() => risks.filter((item) => item.risk_level === "HIGH").length, [risks]);
  const topRisks = useMemo(() => [...risks].filter((risk) => `${risk.code} ${risk.company_name} ${risk.risk_level}`.toLowerCase().includes(riskQuery.toLowerCase())).sort((a, b) => {
    const first = a[riskSortKey]; const second = b[riskSortKey];
    const result = typeof first === "number" && typeof second === "number" ? first - second : String(first).localeCompare(String(second), "id", { numeric: true });
    return result * (riskSortDirection === "asc" ? 1 : -1);
  }), [riskQuery, riskSortDirection, riskSortKey, risks]);
  const riskPageCount = Math.max(1, Math.ceil(topRisks.length / riskPageSize));
  const visibleRisks = topRisks.slice((Math.min(riskPage, riskPageCount) - 1) * riskPageSize, Math.min(riskPage, riskPageCount) * riskPageSize);
  const toggleRiskSort = (key: RiskSortKey) => { setRiskSortDirection((current) => riskSortKey === key && current === "asc" ? "desc" : "asc"); setRiskSortKey(key); setRiskPage(1); };
  const riskHeader = (label: string, key: RiskSortKey, align: "left" | "right" = "left") => <SortableHeader label={label} align={align} active={riskSortKey === key} direction={riskSortDirection} onClick={() => toggleRiskSort(key)} />;

  if (loading) return <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white"><LoaderCircle className="size-7 animate-spin text-amber-500" /></div>;
  if (error || !overview) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><AlertTriangle className="mx-auto size-7 text-rose-500" /><h2 className="mt-3 font-bold text-rose-900">Ringkasan tidak tersedia</h2><p className="mt-1 text-sm text-rose-700">{error}</p><button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white"><RefreshCw className="size-3.5" />Coba lagi</button></div>;

  const cards = [
    { label: "Rata-rata Rasio Bahan Bakar", value: `${overview.averageFuelRatio.toFixed(3)} L/BCM`, helper: "Aktual seluruh aktivitas", icon: Gauge, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Bahan Bakar", value: `${formatNumber(overview.totalFuelConsumption)} L`, helper: "Akumulasi ringkasan aktual", icon: Fuel, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Total Produksi", value: `${formatNumber(overview.totalProduction)} BCM`, helper: "Volume produksi tercatat", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Kontraktor Berisiko", value: `${riskCount} kontraktor`, helper: "Tingkat risiko tinggi dari Mamdani", icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">Ringkasan</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Pusat Kendali Operasional</h2><p className="mt-1 text-sm text-slate-500">Ringkasan kondisi rasio bahan bakar, produksi, dan risiko kontraktor.</p></div><button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-amber-300 hover:text-amber-700"><RefreshCw className="size-3.5" />Perbarui ringkasan</button></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{card.value}</p></div><span className={`rounded-xl p-2.5 ${card.bg} ${card.color}`}><Icon className="size-5" /></span></div><p className="mt-2 text-xs text-slate-500">{card.helper}</p></div>; })}</section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)]"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><Activity className="size-5 text-blue-600" />Tren Rasio Bahan Bakar</h3><p className="mt-1 text-xs text-slate-500">Perbandingan data transaksi aktual per waktu dengan target SPO.</p></div><span title="Grafik diperbarui otomatis setiap 10 detik" className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700"><span className="mr-1 inline-block size-1.5 rounded-full bg-blue-500" />Langsung{lastUpdated ? ` · ${lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}</span></div><TrendChart trend={overview.trend} /></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><Building2 className="size-5 text-blue-600" />Komposisi Bahan Bakar per Aktivitas</h3><p className="mt-1 text-xs text-slate-500">Kontribusi pemakaian bahan bakar dari setiap aktivitas operasional.</p></div><FuelCompositionDonut activities={overview.activities} totalFuel={overview.totalFuelConsumption} /></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><ShieldAlert className="size-5 text-rose-500" />Prioritas Risiko Kontraktor</h3>
          <p className="mt-1 text-xs text-slate-500">Kontraktor dengan skor risiko Mamdani tertinggi beserta pemicu risiko utamanya.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3"><DataTableSearch value={riskQuery} onChange={(value) => { setRiskQuery(value); setRiskPage(1); }} placeholder="Cari kontraktor atau risiko..." /><span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600"><Users className="size-3.5" />{risks.length} kontraktor dianalisis</span></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
            <tr><th className="px-5 py-3">{riskHeader("Kontraktor", "company_name")}</th><th className="px-5 py-3 text-right">{riskHeader("Skor Risiko", "risk_score", "right")}</th><th className="px-5 py-3 text-right">{riskHeader("Deviasi Bahan Bakar", "fuel_deviation_ratio", "right")}</th><th className="px-5 py-3 text-right">{riskHeader("Pendukung/Pengeringan", "support_dewatering_population", "right")}</th><th className="px-5 py-3">{riskHeader("Status", "risk_level")}</th><th className="px-5 py-3">Alasan Risiko</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRisks.map((risk) => <tr key={risk.contractor_id} className="hover:bg-slate-50">
              <td className="px-5 py-4"><p className="font-semibold text-slate-900">{risk.company_name}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">{risk.code}</p></td>
              <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">{risk.risk_score.toFixed(3)}</td>
              <td className="px-5 py-4 text-right font-mono text-slate-600">{((risk.fuel_deviation_ratio - 1) * 100).toFixed(1)}%</td>
              <td className="px-5 py-4 text-right font-mono text-slate-600">{risk.support_dewatering_population} unit</td>
              <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${riskStyle[risk.risk_level]}`}>{risk.risk_level}</span></td>
              <td className="max-w-[360px] px-5 py-4"><p className="leading-relaxed text-slate-600">{explainDominantRules(risk.dominant_rules)}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-slate-400">Aturan: {risk.dominant_rules.replaceAll("_", " ")}</p></td>
            </tr>)}
          </tbody>
        </table>
        {topRisks.length === 0 && <p className="p-10 text-center text-sm text-slate-400">Tidak ada kontraktor yang sesuai pencarian.</p>}
      </div>
      <DataTablePagination page={riskPage} pageCount={riskPageCount} total={topRisks.length} pageSize={riskPageSize} onPageChange={setRiskPage} />
    </section>
  </div>;
}
