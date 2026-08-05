"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, Clock3, Fuel, Gauge, Layers3, LoaderCircle, PackageOpen, ShieldCheck, Target, Truck } from "lucide-react";
import { getActivity } from "@/lib/api";
import { ACTIVITY_META, ActivityKey, ActivityResponse } from "@/lib/frms-types";
import { useFilterStore } from "@/lib/filters";
import { FilterBar } from "./filter-bar";
import { FuelGauge } from "./fuel-gauge";
import { FuelTrendChart } from "./frms-charts";
import { MetricCard } from "./metric-card";
import { StatusBadge } from "./status-badge";
import { UnitTable } from "./unit-table";

const fmt = (value: number, digits = 0) => value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
const prettyActivity = (activity: ActivityKey) => ACTIVITY_META[activity].label;

export function ActivityPage({ activity }: { activity: ActivityKey }) {
  const { from, to, contractor, unit } = useFilterStore();
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiMode, setApiMode] = useState("API connected");

  useEffect(() => {
    let active = true;
    getActivity(activity, { from, to, contractor, unit }).then((response) => {
      if (active) { setData(response); setApiMode("API connected"); setLoading(false); }
    }).catch(() => {
      if (active) { setApiMode("Seed snapshot"); setLoading(false); }
    });
    return () => { active = false; };
  }, [activity, from, to, contractor, unit]);

  const summary = data?.summary;
  const meta = ACTIVITY_META[activity];

  return <div className="dashboard-page">
    <div className="page-header">
      <div><div className="breadcrumb"><Link href="/overview">Overview</Link><span>/</span><span>Fuel ratio monitoring</span><span>/</span><strong>{prettyActivity(activity)}</strong></div><div className="page-title-row"><div className={`page-icon page-icon-${activity}`}><Activity size={22} /></div><div><h1>{prettyActivity(activity)} <span className="title-slash">/</span> fuel ratio</h1><p>{meta.description} · activity-based efficiency monitor</p></div></div></div>
      <div className="header-status"><span className="live-pulse" /> {apiMode}<small>Read-only · 05 Aug 2026</small></div>
    </div>

    <FilterBar contractors={data?.contractors ?? []} units={data?.units ?? []} />

    {loading || !summary ? <div className="loading-state"><LoaderCircle className="spin" size={23} /><span>Loading activity register…</span></div> : <>
      <div className="activity-kpis">
        <MetricCard label="Actual fuel ratio" value={summary.actualFR.toFixed(4)} unit="L / BCM" icon={Gauge} accent={summary.variancePct > 10 ? "red" : "amber"} note="Activity weighted average" />
        <MetricCard label="Target SPO" value={summary.spoFR.toFixed(4)} unit="L / BCM" icon={Target} accent="teal" note="Standard operational parameter" />
        <MetricCard label="Fuel consumed" value={summary.fuelConsumption >= 1000 ? `${(summary.fuelConsumption / 1000).toFixed(2)}k` : fmt(summary.fuelConsumption)} unit="L / h" icon={Fuel} accent="orange" note="Across registered equipment" />
        {activity === "loading" || activity === "hauling" ? <MetricCard label="Productivity" value={summary.productivity >= 1000 ? `${(summary.productivity / 1000).toFixed(1)}k` : fmt(summary.productivity, 1)} unit="BCM / h" icon={Truck} accent="blue" note="Production equipment output" /> : <MetricCard label="Equipment working hours" value={activity === "supporting" ? "4,121" : "4,899"} unit="h / yr" icon={Clock3} accent="blue" note={`${activity === "supporting" ? "PA 90% · UA 53%" : "PA 90% · UA 63%"}`} />}
        <MetricCard label="Variance to SPO" value={`${summary.variancePct > 0 ? "+" : ""}${summary.variancePct.toFixed(1)}%`} icon={summary.variancePct > 0 ? ShieldCheck : PackageOpen} accent={summary.variancePct > 10 ? "red" : "amber"} note={summary.variancePct > 10 ? "Requires operational review" : "Within monitoring threshold"} />
      </div>

      <div className="activity-main-grid">
        <section className="panel gauge-panel"><div className="section-kicker"><Gauge size={13} /> INSTRUMENT READOUT</div><div className="panel-heading"><div><h2>{prettyActivity(activity)} efficiency index</h2><p>Current actual against SPO target</p></div><StatusBadge variance={summary.variancePct} /></div><FuelGauge summary={summary} large /><div className="gauge-legend"><span><i className="legend-dot actual-dot" /> Actual</span><span><i className="legend-dot target-dot" /> SPO target</span><span className="gauge-threshold">Threshold +10%</span></div></section>
        <section className="panel trend-panel"><div className="panel-heading"><div><div className="section-kicker"><Activity size={13} /> 21-DAY PERFORMANCE</div><h2>Fuel ratio trend</h2><p>Daily weighted average · liters per BCM</p></div><div className="trend-legend"><span><i className="line-key actual-line" /> Actual</span><span><i className="line-key target-line" /> SPO target</span></div></div><FuelTrendChart data={data.trend} /><div className="trend-insight"><div className="insight-icon"><ArrowRight size={15} /></div><p><strong>{summary.variancePct.toFixed(1)}% above SPO target.</strong> {activity === "hauling" ? "Hauling remains the largest contributor to the combined fuel ratio." : "Use the unit register below to isolate the equipment driving the variance."}</p></div></section>
      </div>

      <div className="detail-strip"><div><span className="section-kicker"><Layers3 size={13} /> SCOPE SNAPSHOT</span><strong>{summary.equipmentCount.toLocaleString()} active units</strong></div><div><span className="section-kicker"><Fuel size={13} /> FUEL RATE</span><strong>{fmt(summary.fuelConsumption, 0)} L / hour</strong></div><div><span className="section-kicker"><Target size={13} /> MONITORING</span><strong>{data.trend.length} daily points</strong></div><div><span className="section-kicker"><ShieldCheck size={13} /> DATA QUALITY</span><strong className="text-teal">Validated seed</strong></div></div>
      <UnitTable activity={activity} units={data.units} />
    </>}
  </div>;
}
