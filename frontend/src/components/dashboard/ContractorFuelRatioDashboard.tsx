"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, LoaderCircle, RefreshCw } from "lucide-react";
import { ContractorDetailRow, ContractorDetailTable } from "@/components/dashboard/ContractorDetailTable";
import { ContractorEquipmentFleet } from "@/components/dashboard/ContractorEquipmentFleet";
import { ActivityBreakdown, ContractorLeaderboardChart, ContractorPerformance } from "@/components/dashboard/ContractorLeaderboardChart";
import { ContractorOverviewCards } from "@/components/dashboard/ContractorOverviewCards";
import { Contractor, Equipment, fetchContractors, fetchDewateringSummaries, fetchEquipment, fetchHaulingSummaries, fetchLoadingSummaries, fetchSupportingSummaries } from "@/lib/api";

type Activity = "Loading" | "Hauling" | "Supporting" | "Dewatering";
type OperationalRecord = { contractorId: number; activity: Activity; ratio: number; fuelRate: number; fuelLiters: number; production: number; };
const activities: Activity[] = ["Loading", "Hauling", "Supporting", "Dewatering"];
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

export function ContractorFuelRatioDashboard() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [records, setRecords] = useState<OperationalRecord[]>([]);
  const [selectedCode, setSelectedCode] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true); setError(null);
    try {
      const [contractorData, equipmentData, loadingData, haulingData, supportingData, dewateringData] = await Promise.all([fetchContractors(), fetchEquipment(), fetchLoadingSummaries(), fetchHaulingSummaries(), fetchSupportingSummaries(), fetchDewateringSummaries()]);
      const equipmentByUnit = new Map<string, Equipment>();
      equipmentData.forEach((item) => { if (!equipmentByUnit.has(item.unit_type)) equipmentByUnit.set(item.unit_type, item); });
      const contractorFor = (unitType: string) => equipmentByUnit.get(unitType)?.contractor_id;
      const summaryRecords: OperationalRecord[] = [];
      const appendRate = (items: Array<{ unit_type: string; fuel_ratio: number; fuel_cons: number; productivity: number }>, activity: "Loading" | "Hauling") => items.forEach((item) => { const contractorId = contractorFor(item.unit_type); if (contractorId) summaryRecords.push({ contractorId, activity, ratio: item.fuel_ratio, fuelRate: item.fuel_cons, fuelLiters: 0, production: item.productivity }); });
      appendRate(loadingData, "Loading"); appendRate(haulingData, "Hauling");
      supportingData.forEach((item) => { const contractorId = contractorFor(item.unit_type); if (contractorId) summaryRecords.push({ contractorId, activity: "Supporting", ratio: item.fuel_ratio, fuelRate: item.fuel_cons_lhr, fuelLiters: item.total_fuel_liters, production: item.total_mine_prod_bcm }); });
      dewateringData.forEach((item) => { const contractorId = contractorFor(item.unit_type); if (contractorId) summaryRecords.push({ contractorId, activity: "Dewatering", ratio: item.fuel_ratio, fuelRate: item.fuel_cons_lhr, fuelLiters: item.total_fuel_liters, production: item.total_mine_prod_bcm }); });
      setContractors(contractorData); setEquipment(equipmentData); setRecords(summaryRecords);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Data dashboard tidak dapat dimuat."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedContractor = contractors.find((item) => item.code === selectedCode);
  const visibleContractors = selectedCode === "ALL" ? contractors : contractors.filter((item) => item.code === selectedCode);
  const visibleIds = new Set(visibleContractors.map((item) => item.id));
  const visibleEquipment = equipment.filter((item) => visibleIds.has(item.contractor_id));
  const visibleRecords = records.filter((item) => visibleIds.has(item.contractorId));
  const metrics = useMemo(() => contractors.map((contractor) => {
    const contractorRecords = records.filter((item) => item.contractorId === contractor.id);
    const contractorEquipment = equipment.filter((item) => item.contractor_id === contractor.id);
    const fuelRatio = average(contractorRecords.map((item) => item.ratio));
    return { contractor, fuelRatio, units: contractorEquipment.reduce((sum, item) => sum + item.qty, 0), fuelLiters: contractorRecords.reduce((sum, item) => sum + item.fuelLiters, 0), production: contractorRecords.filter((item) => item.activity === "Loading" || item.activity === "Hauling").reduce((sum, item) => sum + item.production, 0), counts: Object.fromEntries(activities.map((activity) => [activity, contractorEquipment.filter((item) => item.activity === activity).reduce((sum, item) => sum + item.qty, 0)])) as Record<Activity, number> };
  }), [contractors, equipment, records]);
  const ranking = metrics.filter((item) => item.fuelRatio !== null).sort((a, b) => (a.fuelRatio ?? Infinity) - (b.fuelRatio ?? Infinity));
  const leaderboard: ContractorPerformance[] = ranking.map((item, index) => ({ code: item.contractor.code, name: item.contractor.company_name, fuelRatio: item.fuelRatio!, status: index === 0 ? "Terendah" : index === ranking.length - 1 ? "Tertinggi" : "Tersedia" }));
  const activityBreakdown: ActivityBreakdown[] = activities.map((activity) => { const relevant = visibleRecords.filter((item) => item.activity === activity); return { activity, fuelRatio: average(relevant.map((item) => item.ratio)), recordCount: relevant.length }; });
  const detailRows: ContractorDetailRow[] = metrics.map((item) => ({ id: item.contractor.id, code: item.contractor.code, name: item.contractor.company_name, status: item.contractor.status, totalEquipment: item.units, loadingCount: item.counts.Loading, haulingCount: item.counts.Hauling, supportingCount: item.counts.Supporting, dewateringCount: item.counts.Dewatering, fuelConsLiters: item.fuelLiters, totalBcmProd: item.production, fuelRatio: item.fuelRatio }));
  const overallRatio = average(visibleRecords.map((item) => item.ratio));
  const totalProduction = visibleRecords.filter((item) => item.activity === "Loading" || item.activity === "Hauling").reduce((sum, item) => sum + item.production, 0);
  const fuelThirtyDayEstimate = visibleRecords.reduce((sum, item) => sum + item.fuelRate, 0) * 24 * 30;
  const top = ranking[0]?.contractor.company_name ?? "Belum ada data";

  if (loading) return <div className="flex min-h-[440px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70"><LoaderCircle className="h-6 w-6 animate-spin text-amber-400" /></div>;
  if (error) return <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center"><AlertTriangle className="mx-auto h-6 w-6 text-rose-400" /><p className="mt-3 text-sm font-semibold text-white">Data dashboard tidak tersedia</p><p className="mt-1 text-xs text-slate-400">{error}</p><button onClick={loadDashboard} className="mt-4 rounded-xl bg-slate-800 px-3 py-2 text-xs text-white">Coba lagi</button></div>;

  return <div className="space-y-6"><section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Operational intelligence</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Dashboard Performa Kontraktor</h2><p className="mt-1 text-xs text-slate-400">Perbandingan kondisi operasional seluruh kontraktor, tanpa tren waktu.</p></div><button onClick={loadDashboard} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"><RefreshCw className="h-3.5 w-3.5" />Perbarui data</button></section><section className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_210px]"><label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] font-medium text-slate-400"><Building2 className="h-4 w-4 shrink-0 text-amber-400" /><span className="min-w-fit">Filter kontraktor</span><select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500"><option value="ALL">Semua kontraktor</option>{contractors.map((item) => <option key={item.id} value={item.code}>{item.code} — {item.company_name}</option>)}</select></label><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Kontraktor</p><p className="mt-2 text-2xl font-bold text-white">{contractors.length} perusahaan</p><p className="mt-1 text-[11px] text-slate-500">Kontraktor terdaftar</p></div></section><ContractorOverviewCards selectedContractor={selectedCode} totalEquipment={visibleEquipment.reduce((sum, item) => sum + item.qty, 0)} overallFuelRatio={overallRatio} topEfficientContractor={top} totalProduction={totalProduction} fuelThirtyDayEstimate={fuelThirtyDayEstimate} /><ContractorLeaderboardChart contractors={leaderboard} selectedContractor={selectedCode} onSelectContractor={setSelectedCode} activityBreakdown={activityBreakdown} /><ContractorDetailTable data={detailRows} selectedContractor={selectedCode} onSelectContractor={setSelectedCode} /><ContractorEquipmentFleet selectedContractorCode={selectedCode} selectedContractorName={selectedContractor?.company_name ?? "Semua Kontraktor"} equipments={visibleEquipment} /></div>;
}
