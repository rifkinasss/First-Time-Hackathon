export type OperationalActivity = "loading" | "hauling" | "supporting" | "dewatering";

export interface Contractor { id: number; code: string; company_name: string; status: string; created_at: string; updated_at: string; }
export type ContractorCreateInput = Pick<Contractor, "code" | "company_name" | "status">;
export type ContractorUpdateInput = Partial<Pick<Contractor, "company_name" | "status">>;

export interface Equipment { id: number; contractor_id: number; unit_type: string; item: string; activity: string; qty: number; productivity: number | null; created_at: string; updated_at: string; }
export type EquipmentCreateInput = Omit<Equipment, "id" | "created_at" | "updated_at">;
export type EquipmentUpdateInput = Partial<Omit<EquipmentCreateInput, "contractor_id">>;

export interface FuelReference { id: number; merk: string; type: string; activity: string; average: number; low: number; mid: number; high: number; created_at: string; updated_at: string; }
export type FuelReferenceCreateInput = Omit<FuelReference, "id" | "created_at" | "updated_at">;
export type FuelReferenceUpdateInput = Partial<FuelReferenceCreateInput>;

export interface LoadingSummary { id: number; loading_id: number; unit_type: string; fuel_type: string; fuel_cons: number; productivity: number; fuel_ratio: number; created_at: string; fuel_cons_reference?: number | null; fuel_cons_actual?: number | null; fuel_ratio_reference?: number | null; fuel_ratio_actual?: number | null; data_source?: string; }
export interface HaulingSummary { id: number; hauling_id: number; unit_type: string; fuel_type: string; distance_km: number; fuel_cons: number; productivity: number; fuel_ratio: number; fuel_cons_reference?: number | null; fuel_cons_actual?: number | null; fuel_ratio_reference?: number | null; fuel_ratio_actual?: number | null; data_source?: string; created_at: string; }
export interface SupportingSummary { id: number; supporting_id: number; unit_type: string; fuel_type: string; pa: number; ua: number; ewh: number; fuel_cons_lhr: number; total_fuel_liters: number; total_mine_prod_bcm: number; fuel_ratio: number; fuel_cons_reference?: number | null; fuel_cons_actual?: number | null; fuel_ratio_reference?: number | null; fuel_ratio_actual?: number | null; data_source?: string; created_at: string; }
export interface DewateringSummary { id: number; dewatering_id: number; unit_type: string; fuel_type: string; pa: number; ua: number; ewh: number; fuel_cons_lhr: number; total_fuel_liters: number; total_mine_prod_bcm: number; fuel_ratio: number; fuel_cons_reference?: number | null; fuel_cons_actual?: number | null; fuel_ratio_reference?: number | null; fuel_ratio_actual?: number | null; data_source?: string; created_at: string; }

export interface MonitoringTrendPoint { date: string; actualFR: number; spoFR: number; fuelConsumption: number; production: number; }
export interface MonitoringActivitySummary { activity: string; label: string; actualFR: number; spoFR: number; variancePct: number; fuelConsumption: number; productivity: number; equipmentCount: number; }
export interface MonitoringOverview { totalFuelConsumption: number; totalProduction: number; averageFuelRatio: number; totalContractors: number; totalEquipment: number; averageProductivity: number; trend: MonitoringTrendPoint[]; activities: MonitoringActivitySummary[]; }

export interface AlignmentCategoryBreakdown { activity: string; actual_fuel_liters: number; target_spo_fuel_liters: number; fuel_variance_liters: number; cost_variance_idr: number; actual_fuel_ratio: number; target_spo_fuel_ratio: number; status: "ALIGNED" | "OVER_CONSUMPTION" | "EFFICIENT"; }
export interface ReconciliationActionItem { category: string; title: string; description: string; priority: "HIGH" | "MEDIUM" | "LOW"; }
export interface SPOAlignment { period: string; actual_total_fuel_liters: number; target_spo_fuel_liters: number; fuel_variance_liters: number; fuel_variance_pct: number; cost_impact_idr: number; actual_production_bcm: number; target_production_bcm: number; production_gap_bcm: number; required_production_for_target_fr: number; actual_fuel_ratio: number; target_spo_fuel_ratio: number; fuel_ratio_variance: number; alignment_status: "ALIGNED" | "OVER_BUDGET" | "HIGHLY_EFFICIENT"; reconciliation_actions: ReconciliationActionItem[]; category_breakdowns: AlignmentCategoryBreakdown[]; }
export interface SPOAlignmentSimulationInput { actual_fuel_cons_liters: number; actual_production_bcm: number; target_spo_fuel_ratio: number; target_production_bcm: number; fuel_price_per_liter: number; }

export interface ContractorFuzzyRisk { contractor_id: number; code: string; company_name: string; productivity: number | null; support_dewatering_population: number; fuel_deviation_ratio: number; support_dewatering_fuel_share_pct: number; risk_score: number; risk_level: "LOW" | "NORMAL" | "HIGH"; dominant_rules: string; membership: Record<string, Record<string, number>>; config_version: string; }
export interface ContractorActivityPerformance { activity: string; label: string; actual_fuel_ratio: number; target_fuel_ratio: number; actual_productivity: number; actual_fuel_cons: number; equipment_count: number; }
export interface ContractorEquipmentPerformance { equipment_id: number; unit_type: string; item: string; activity: string; qty: number; actual_fuel_cons: number; actual_productivity: number | null; actual_fuel_ratio: number; target_fuel_ratio: number; variance_pct: number; }
export interface ContractorPerformance { contractor_id: number; code: string; company_name: string; actual_productivity: number; target_productivity: number; actual_fuel_cons: number; actual_fuel_ratio: number; target_fuel_ratio: number; productivity_variance_pct: number; fuel_ratio_variance_pct: number; support_dewatering_population: number; support_dewatering_fuel_cons: number; support_dewatering_fuel_share_pct: number; support_dewatering_fuel_ratio: number; performance_status: string; rule_applied: string; insight: string; activity_breakdowns: ContractorActivityPerformance[]; equipment_breakdowns: ContractorEquipmentPerformance[]; }

export interface MonitoringUnitRecord { unitType: string; category?: string | null; contractor: string; qty: number; fuelConsumption: number; productivity?: number | null; PA?: number | null; UA?: number | null; EWH?: number | null; fuelRatio: number; spoTarget: number; variancePct: number; fuzzyRiskScore?: number | null; fuzzyRiskLevel?: "LOW" | "NORMAL" | "HIGH" | null; fuzzyDominantRules?: string | null; }
export interface MonitoringActivityDetail { activity: string; label: string; units: MonitoringUnitRecord[]; trend: MonitoringTrendPoint[]; summary: MonitoringActivitySummary; contractors: string[]; }
export interface HaulingDistanceReference { id: number; km: number; load_time: number; haul_time: number; dump_time: number; return_time: number; cycle_time: number; bcm_per_hr: number; created_at: string; }

export interface OperationalBatchCalculation { total_units_processed: number; total_fuel_liters: number; total_mine_prod_bcm: number; overall_fuel_ratio: number; details: Array<SupportingSummary | DewateringSummary>; }
export interface OperationalCalculationSummary { fuel_cons?: number; productivity?: number; fuel_ratio?: number; fuel_cons_actual?: number | null; fuel_ratio_actual?: number | null; total_fuel_liters?: number; total_mine_prod_bcm?: number; data_source?: string; }
export interface OperationalCalculation { id: number; equipment_id: number; fuel_reference_id: number; created_at: string; summary?: OperationalCalculationSummary | null; }
export interface OperatingInput { unit_type: string; fuel_type: string; pa?: number; ua?: number; ewh?: number; total_mine_prod_bcm?: number; fuel_consumed_liters?: number; operating_hours?: number; }
export interface OperationalReferenceInput { equipment_id: number; fuel_reference_id: number; }
