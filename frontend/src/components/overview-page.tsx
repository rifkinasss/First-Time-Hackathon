"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, BarChart3, Boxes, Droplets, Fuel, Gauge, HardHat, LoaderCircle, Pickaxe, ShipWheel, Truck } from "lucide-react";
import { getOverview } from "@/lib/api";
import { ACTIVITY_META, ActivityKey, OverviewResponse } from "@/lib/frms-types";
import { OverviewTrendChart } from "./frms-charts";
import { FuelGauge } from "./fuel-gauge";
import { MetricCard } from "./metric-card";
import { StatusBadge } from "./status-badge";

import { useFilterStore } from "@/lib/filters";
import { FilterBar } from "./filter-bar";

const fmt = (value: number, digits = 0) => value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
const activities: ActivityKey[] = ["loading", "hauling", "supporting", "dewatering"];
const ActivityIcon = ({ activity }: { activity: ActivityKey }) => activity === "loading" ? <Pickaxe size={17} /> : activity === "hauling" ? <Truck size={17} /> : activity === "supporting" ? <HardHat size={17} /> : <Droplets size={17} />;

export function OverviewPage() {
  const { from, to, contractor, unit } = useFilterStore();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    getOverview({ from, to, contractor, unit }).then(setData).finally(() => setLoading(false)); 
  }, [from, to, contractor, unit]);

  return <div className="dashboard-page">
    <div className="page-header overview-header"><div><div className="breadcrumb"><strong>Overview</strong><span>/</span><span>Executive dashboard</span></div><div className="page-title-row"><div className="page-icon page-icon-overview"><BarChart3 size={22} /></div><div><h1>Operational overview <span className="title-slash">/</span> fuel ratio</h1><p>Activity-based fuel efficiency across Kaltim operations</p></div></div></div><div className="overview-period"><span className="eyebrow">REPORTING WINDOW</span><strong>01 — 21 JUL 2026</strong><span className="period-status"><span className="live-pulse" /> Latest data available</span></div></div>
    <FilterBar contractors={data?.activities.length ? ["PT. A", "PT. B", "PT. C", "PT. D", "PT. E", "PT. F", "PT. G", "PT. H", "PT. I", "PT. J"] : []} units={[]} />
    {loading || !data ? <div className="loading-state"><LoaderCircle className="spin" size={23} /><span>Loading executive snapshot…</span></div> : <>
      <div className="overview-kpis">
        <MetricCard label="Total fuel consumption" value={`${(data.totalFuelConsumption / 1000).toFixed(1)}k`} unit="L / h" icon={Fuel} accent="amber" note="Across all monitored activities"><div className="metric-spark amber-spark"><i /><i /><i /><i /><i /><i /><i /></div></MetricCard>
        <MetricCard label="Total production" value={`${(data.totalProduction / 1000).toFixed(1)}k`} unit="BCM / h" icon={Boxes} accent="blue" note="Loading + hauling output" />
        <MetricCard label="Activity-based FR" value={data.averageFuelRatio.toFixed(4)} unit="L / BCM" icon={Gauge} accent="red" note="Combined actual · target 1.2444"><StatusBadge variance={16.99} compact /></MetricCard>
        <MetricCard label="Active contractors" value={fmt(data.totalContractors)} unit="partners" icon={HardHat} accent="teal" note="Across current reporting window" />
        <MetricCard label="Active equipment" value={fmt(data.totalEquipment)} unit="units" icon={Truck} accent="blue" note="Registered unit quantity" />
        <MetricCard label="Avg productivity" value={`${(data.averageProductivity / 1000).toFixed(1)}k`} unit="BCM / h" icon={ShipWheel} accent="teal" note="Production activity average" />
      </div>

      <div className="overview-main-grid"><section className="panel overview-chart-panel"><div className="panel-heading"><div><div className="section-kicker"><Activity size={13} /> EXECUTIVE TREND</div><h2>Combined fuel ratio</h2><p>Actual activity sum against combined SPO target</p></div><div className="trend-legend"><span><i className="line-key actual-line" /> Actual <strong>{data.averageFuelRatio.toFixed(4)}</strong></span><span><i className="line-key target-line" /> SPO <strong>1.2444</strong></span></div></div><OverviewTrendChart data={data.trend} /><div className="chart-footer"><span>Lower is better · ratio = fuel consumed / production</span><span>Last 21 days <ArrowRight size={13} /></span></div></section><section className="panel alert-panel"><div className="panel-heading"><div><div className="section-kicker"><Gauge size={13} /> PRIORITY SIGNALS</div><h2>Where to focus</h2><p>Contribution to current variance</p></div><span className="alert-count">02</span></div><div className="focus-list"><div className="focus-item focus-critical"><div className="focus-index">01</div><div className="focus-content"><div><strong>Hauling</strong><StatusBadge variance={17} compact /></div><p>Highest activity ratio · 0.7028 L/BCM</p><div className="focus-bar"><span style={{ width: "84%" }} /></div><small>48.3% of total FR</small></div><ArrowRight size={15} /></div><div className="focus-item"><div className="focus-index">02</div><div className="focus-content"><div><strong>Dewatering</strong><StatusBadge variance={17} compact /></div><p>Large pump fleet · 0.3783 L/BCM</p><div className="focus-bar"><span style={{ width: "46%" }} /></div><small>26.0% of total FR</small></div><ArrowRight size={15} /></div></div><div className="alert-footer"><span className="live-pulse" /> Monitoring 4 activity streams <Link href="/fuel-ratio/hauling">View highest variance <ArrowRight size={13} /></Link></div></section></div>

      <section className="activity-summary-section"><div className="section-heading-row"><div><div className="section-kicker"><BarChart3 size={13} /> ACTIVITY PULSE</div><h2>Performance by activity</h2><p>Click any instrument to inspect its unit register</p></div><Link href="/fuel-ratio/loading" className="outline-button">Open monitoring <ArrowRight size={14} /></Link></div><div className="activity-grid">{activities.map((activity) => { const summary = data.activities.find((item) => item.activity === activity)!; return <Link href={`/fuel-ratio/${activity}`} className="activity-card" key={activity}><div className="activity-card-top"><div className={`activity-symbol symbol-${activity}`}><ActivityIcon activity={activity} /></div><span className="activity-arrow"><ArrowRight size={15} /></span></div><div className="activity-card-title"><div><h3>{ACTIVITY_META[activity].label}</h3><p>{ACTIVITY_META[activity].description}</p></div><StatusBadge variance={summary.variancePct} compact /></div><FuelGauge summary={summary} /><div className="activity-card-meta"><span>{summary.equipmentCount.toLocaleString()} units</span><span>{(summary.fuelConsumption / 1000).toFixed(1)}k L/h</span></div></Link>; })}</div></section>
    </>}
  </div>;
}
