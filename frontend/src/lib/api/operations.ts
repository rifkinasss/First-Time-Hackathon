import { fetchData, requestData } from "./client";
import type { DewateringSummary, HaulingDistanceReference, HaulingSummary, LoadingSummary, OperationalBatchCalculation, OperationalCalculation, OperationalReferenceInput, OperatingInput, SupportingSummary } from "@/types/api";

export const fetchLoadingSummaries = () => fetchData<LoadingSummary[]>("/loadings/summary");
export const fetchHaulingSummaries = () => fetchData<HaulingSummary[]>("/haulings/summary");
export const fetchSupportingSummaries = () => fetchData<SupportingSummary[]>("/supportings/summary");
export const fetchDewateringSummaries = () => fetchData<DewateringSummary[]>("/dewaterings/summary");
export const fetchHaulingDistanceReferences = () => fetchData<HaulingDistanceReference[]>("/haulings/distance-ref");

export const calculateLoading = (input: OperationalReferenceInput & Pick<OperatingInput, "fuel_consumed_liters" | "operating_hours">) => requestData<OperationalCalculation>("/loadings/calculate", { method: "POST", body: JSON.stringify(input) });
export const calculateHauling = (input: OperationalReferenceInput & { distance_km: number }) => requestData<OperationalCalculation>("/haulings/calculate", { method: "POST", body: JSON.stringify(input) });
export const calculateSupporting = (input: OperationalReferenceInput & Omit<OperatingInput, "unit_type" | "fuel_type">) => requestData<OperationalCalculation>("/supportings/calculate", { method: "POST", body: JSON.stringify(input) });
export const calculateDewatering = (input: OperationalReferenceInput & Omit<OperatingInput, "unit_type" | "fuel_type">) => requestData<OperationalCalculation>("/dewaterings/calculate", { method: "POST", body: JSON.stringify(input) });
export const calculateSupportingAll = (input: { contractor_id: number } & Omit<OperatingInput, "unit_type" | "fuel_type">) => requestData<OperationalBatchCalculation>("/supportings/calculate-all", { method: "POST", body: JSON.stringify(input) });
export const calculateDewateringAll = (input: { contractor_id: number } & Omit<OperatingInput, "unit_type" | "fuel_type">) => requestData<OperationalBatchCalculation>("/dewaterings/calculate-all", { method: "POST", body: JSON.stringify(input) });

export const deleteLoading = (id: number) => requestData<{ loading_id: number }>(`/loadings/${id}`, { method: "DELETE" });
export const deleteHauling = (id: number) => requestData<{ hauling_id: number }>(`/haulings/${id}`, { method: "DELETE" });
export const deleteSupporting = (id: number) => requestData<{ supporting_id: number }>(`/supportings/${id}`, { method: "DELETE" });
export const deleteDewatering = (id: number) => requestData<{ dewatering_id: number }>(`/dewaterings/${id}`, { method: "DELETE" });
