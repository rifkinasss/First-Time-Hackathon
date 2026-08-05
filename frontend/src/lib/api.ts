export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Contractor {
  id: number;
  code: string;
  company_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: number;
  contractor_id: number;
  unit_type: string;
  item: string;
  activity: string;
  qty: number;
  productivity: number | null;
  created_at: string;
  updated_at: string;
}

export interface FuelReference {
  id: number;
  merk: string;
  type: string;
  activity: string;
  average: number;
  low: number;
  mid: number;
  high: number;
  created_at: string;
  updated_at: string;
}

export interface LoadingSummary {
  id: number;
  loading_id: number;
  unit_type: string;
  fuel_type: string;
  fuel_cons: number;
  productivity: number;
  fuel_ratio: number;
  created_at: string;
}

export interface HaulingSummary {
  id: number;
  hauling_id: number;
  unit_type: string;
  fuel_type: string;
  distance_km: number;
  fuel_cons: number;
  productivity: number;
  fuel_ratio: number;
  created_at: string;
}

export interface SupportingSummary {
  id: number;
  supporting_id: number;
  unit_type: string;
  fuel_type: string;
  pa: number;
  ua: number;
  ewh: number;
  fuel_cons_lhr: number;
  total_fuel_liters: number;
  total_mine_prod_bcm: number;
  fuel_ratio: number;
  created_at: string;
}

export interface DewateringSummary {
  id: number;
  dewatering_id: number;
  unit_type: string;
  fuel_type: string;
  pa: number;
  ua: number;
  ewh: number;
  fuel_cons_lhr: number;
  total_fuel_liters: number;
  total_mine_prod_bcm: number;
  fuel_ratio: number;
  created_at: string;
}

// Fallback contractors if API is unreachable
const FALLBACK_CONTRACTORS: Contractor[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  code: `PT${String.fromCharCode(65 + i)}`,
  company_name: `PT. ${String.fromCharCode(65 + i)}`,
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export async function fetchContractors(): Promise<Contractor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contractor`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch contractors");
    const data = await res.json();
    return data.length > 0 ? data : FALLBACK_CONTRACTORS;
  } catch (error) {
    console.warn("Using fallback contractors due to network/CORS:", error);
    return FALLBACK_CONTRACTORS;
  }
}

export async function fetchEquipment(): Promise<Equipment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/equipment`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch equipment");
    return await res.json();
  } catch (error) {
    console.warn("Could not fetch equipment from API:", error);
    return [];
  }
}

export async function fetchLoadingSummaries(): Promise<LoadingSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/loading/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch loading summaries");
    return await res.json();
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function fetchHaulingSummaries(): Promise<HaulingSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/hauling/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch hauling summaries");
    return await res.json();
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function fetchSupportingSummaries(): Promise<SupportingSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/supporting/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch supporting summaries");
    return await res.json();
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function fetchDewateringSummaries(): Promise<DewateringSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/dewatering/summary`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch dewatering summaries");
    return await res.json();
  } catch (error) {
    console.warn(error);
    return [];
  }
}
