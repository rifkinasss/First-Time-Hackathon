"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Building2, Fuel, Gauge, LoaderCircle, RefreshCw, ShieldAlert, Users, type LucideIcon } from "lucide-react";
import { fetchContractorFuzzyRisks } from "@/lib/api";
import type { ContractorFuzzyRisk } from "@/types/api";

const statusStyle = {
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
  NORMAL: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const membershipColors = {
  DOWN: "bg-emerald-500",
  NORMAL: "bg-amber-500",
  UP: "bg-rose-500",
};

function MembershipGroup({ title, values }: { title: string; values: Record<string, number> }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold text-slate-800">{title}</p><span className="text-[10px] text-slate-400">μ(x)</span></div><div className="space-y-2">{Object.entries(values).map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-500"><span>{label}</span><span className="font-mono text-slate-700">{value.toFixed(3)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${membershipColors[label as keyof typeof membershipColors] ?? "bg-slate-500"}`} style={{ width: `${value * 100}%` }} /></div></div>)}</div></div>;
}

export function MultiContractorFuelRatio() {
  const [risks, setRisks] = useState<ContractorFuzzyRisk[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContractorFuzzyRisks();
      setRisks(data);
      setSelectedId((current) => current ?? data[0]?.contractor_id ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data fuzzy risk tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const ranking = useMemo(() => [...risks].sort((a, b) => b.risk_score - a.risk_score), [risks]);
  const selected = risks.find((item) => item.contractor_id === selectedId) ?? ranking[0];
  const highRisk = risks.filter((item) => item.risk_level === "HIGH").length;
  const averageScore = risks.length ? risks.reduce((sum, item) => sum + item.risk_score, 0) / risks.length : 0;
  const largestSupportImpact = risks.length ? [...risks].sort((a, b) => b.support_dewatering_population - a.support_dewatering_population)[0] : undefined;

  if (loading) return <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white"><LoaderCircle className="size-7 animate-spin text-amber-500" /></div>;
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><AlertTriangle className="mx-auto size-7 text-rose-500" /><h2 className="mt-3 font-bold text-rose-900">Fuel Ratio Multi-Kontraktor tidak tersedia</h2><p className="mt-1 text-sm text-rose-700">{error}</p><button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white"><RefreshCw className="size-3.5" />Coba lagi</button></div>;

  const cards: Array<{ label: string; value: string; helper: string; icon: LucideIcon; color: string; bg: string }> = [
    { label: "Kontraktor Dianalisis", value: `${risks.length}`, helper: "Snapshot data operasional", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Risk Level HIGH", value: `${highRisk}`, helper: "Perlu prioritas monitoring", icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Rata-rata Risk Score", value: averageScore.toFixed(3), helper: "Hasil defuzzifikasi centroid", icon: Gauge, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Populasi Support Tertinggi", value: largestSupportImpact ? `${largestSupportImpact.support_dewatering_population} unit` : "—", helper: largestSupportImpact?.company_name ?? "Belum ada data", icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return <div className="space-y-6">
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Fitur 01 · Multi-Kontraktor</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Fuel Ratio Multi-Kontraktor</h2><p className="mt-1 text-sm text-slate-500">Bandingkan efisiensi dan prioritas risiko berbasis Mamdani.</p></div><button type="button" onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:border-cyan-300 hover:text-cyan-700"><RefreshCw className="size-3.5" />Perbarui data</button></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const MetricIcon = card.icon; return <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{card.value}</p></div><span className={`rounded-xl p-2.5 ${card.bg} ${card.color}`}><MetricIcon className="size-5" /></span></div><p className="mt-2 text-xs text-slate-500">{card.helper}</p></div>; })}</section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-base font-bold text-slate-950"><BarChart3 className="size-5 text-cyan-600" />Ranking Risk Kontraktor</h3><p className="mt-1 text-xs text-slate-500">Klik kontraktor untuk melihat membership dan pemicu rule.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">Mamdani v{risks[0]?.config_version ?? "—"}</span></div><div className="space-y-3">{ranking.map((risk, index) => <button key={risk.contractor_id} type="button" onClick={() => setSelectedId(risk.contractor_id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.contractor_id === risk.contractor_id ? "border-cyan-400 bg-cyan-50/50" : "border-slate-100 bg-slate-50/50 hover:border-cyan-200 hover:bg-white"}`}><div className="mb-2 flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-900">{risk.company_name}</span><span className="font-mono text-[10px] text-slate-400">{risk.code}</span></span></div><div className="flex shrink-0 items-center gap-2"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyle[risk.risk_level]}`}>{risk.risk_level}</span><span className="font-mono text-sm font-bold text-slate-900">{risk.risk_score.toFixed(3)}</span></div></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${risk.risk_level === "HIGH" ? "bg-rose-500" : risk.risk_level === "NORMAL" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${risk.risk_score * 100}%` }} /></div></button>)}</div></div>
      {selected ? <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">Selected contractor</p><h3 className="mt-1 text-lg font-bold text-slate-950">{selected.company_name}</h3><p className="font-mono text-xs text-slate-400">{selected.code}</p></div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyle[selected.risk_level]}`}>{selected.risk_level}</span></div><div className="mb-5 rounded-xl bg-slate-900 p-4 text-white"><div className="flex items-center justify-between"><span className="text-xs text-slate-300">Risk Score</span><span className="font-mono text-2xl font-bold">{selected.risk_score.toFixed(3)}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400" style={{ width: `${selected.risk_score * 100}%` }} /></div></div><div className="space-y-3"><MembershipGroup title="Produktivitas" values={selected.membership.productivity} /><MembershipGroup title="Populasi Support + Dewatering" values={selected.membership.population} /><MembershipGroup title="Fuel Deviation" values={selected.membership.fuel} /></div><div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3"><div className="flex items-center gap-2 text-xs font-bold text-rose-800"><Fuel className="size-3.5" />Rule dominan</div><p className="mt-1 text-[10px] leading-relaxed text-rose-700">{selected.dominant_rules.replaceAll("_", " ")}</p></div></aside> : <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-400">Belum ada data kontraktor.</div>}
    </section>
  </div>;
}
