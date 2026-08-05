import { fetchData, requestData } from "./client";
import type { ContractorFuzzyRisk, ContractorPerformance, MonitoringActivityDetail, MonitoringOverview, OperationalActivity, SPOAlignment, SPOAlignmentSimulationInput } from "@/types/api";

export const fetchMonitoringOverview = () => fetchData<MonitoringOverview>("/monitoring/overview");
export const fetchContractorFuzzyRisks = () => fetchData<ContractorFuzzyRisk[]>("/contractors/fuzzy-risk");
export const fetchContractorPerformances = () => fetchData<ContractorPerformance[]>("/contractors/performance");
export const fetchContractorPerformance = (id: number) => fetchData<ContractorPerformance>(`/contractors/${id}/performance`);
export const fetchContractorFuzzyRisk = (id: number) => fetchData<ContractorFuzzyRisk>(`/contractors/${id}/fuzzy-risk`);
export async function fetchSPOAlignment(params?: { fuelPrice?: number; targetBcm?: number }) { const query = new URLSearchParams(); if (params?.fuelPrice) query.set("fuel_price", String(params.fuelPrice)); if (params?.targetBcm) query.set("target_bcm", String(params.targetBcm)); return fetchData<SPOAlignment>(`/alignments/summary${query.size ? `?${query.toString()}` : ""}`); }
export const simulateSPOAlignment = (input: SPOAlignmentSimulationInput) => requestData<SPOAlignment>("/alignments/simulate", { method: "POST", body: JSON.stringify(input) });
export async function fetchMonitoringActivity(activity: OperationalActivity, filters: { from?: string; to?: string; contractor?: string; unit?: string } = {}) { const query = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); }); return fetchData<MonitoringActivityDetail>(`/monitoring/fuel-ratio/${activity}${query.size ? `?${query.toString()}` : ""}`); }
