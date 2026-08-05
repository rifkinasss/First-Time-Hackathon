import { ActivityKey, ActivityResponse, Filters, OverviewResponse } from "./frms-types";
import { getMockActivity, getMockOverview } from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getOverview(): Promise<OverviewResponse> {
  try {
    return await request<OverviewResponse>("/api/overview");
  } catch {
    return getMockOverview();
  }
}

export async function getActivity(activity: ActivityKey, filters?: Filters): Promise<ActivityResponse> {
  const params = new URLSearchParams();
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.contractor && filters.contractor !== "all") params.set("contractor", filters.contractor);
  if (filters?.unit && filters.unit !== "all") params.set("unit", filters.unit);
  try {
    return await request<ActivityResponse>(`/api/fuel-ratio/${activity}?${params.toString()}`);
  } catch {
    return getMockActivity(activity);
  }
}
