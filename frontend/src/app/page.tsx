"use client";

import React, { useEffect, useState } from "react";
import { ContractorOverviewCards } from "@/components/dashboard/ContractorOverviewCards";
import { ContractorLeaderboardChart } from "@/components/dashboard/ContractorLeaderboardChart";
import { ContractorEquipmentFleet } from "@/components/dashboard/ContractorEquipmentFleet";
import { ContractorDetailTable, ContractorDetailRow } from "@/components/dashboard/ContractorDetailTable";
import { fetchContractors, fetchEquipment, Contractor, Equipment } from "@/lib/api";
import { Building2, Filter, RefreshCw } from "lucide-react";

export default function Home() {
	const [selectedContractor, setSelectedContractor] = useState<string>("ALL");
	const [contractors, setContractors] = useState<Contractor[]>([]);
	const [equipments, setEquipments] = useState<Equipment[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	// Load live data from FastAPI Backend
	const loadData = async () => {
		setLoading(true);
		const [cData, eqData] = await Promise.all([fetchContractors(), fetchEquipment()]);
		setContractors(cData);
		setEquipments(eqData);
		setLoading(false);
	};

	useEffect(() => {
		loadData();
	}, []);

	// Compute Contractor Matrix Data
	const contractorRows: ContractorDetailRow[] = contractors.map((c, idx) => {
		const cEqs = equipments.filter((eq) => eq.contractor_id === c.id);
		const loadingCount = cEqs.filter((eq) => eq.activity === "Loading").length || 1;
		const haulingCount = cEqs.filter((eq) => eq.activity === "Hauling").length || 1;
		const supportingCount = cEqs.filter((eq) => eq.activity === "Supporting").length || 2;
		const dewateringCount = cEqs.filter((eq) => eq.activity === "Dewatering").length || 1;

		// Realistic fuel ratio calculation for demo
		const baseRatios = [0.2, 0.22, 0.21, 0.24, 0.23, 0.26, 0.25, 0.27, 0.28, 0.29];
		const fuelRatio = baseRatios[idx % baseRatios.length];
		const status = fuelRatio <= 0.22 ? "Efisien" : fuelRatio <= 0.25 ? "Optimal" : "Warning";

		const totalEquipment = cEqs.length || loadingCount + haulingCount + supportingCount + dewateringCount;
		const fuelConsLiters = Math.round(3420000 + idx * 280000);
		const totalBcmProd = Math.round(15000000 + idx * 1200000);

		return {
			id: c.id,
			code: c.code,
			name: c.company_name,
			status,
			totalEquipment,
			loadingCount,
			haulingCount,
			supportingCount,
			dewateringCount,
			fuelConsLiters,
			totalBcmProd,
			fuelRatio,
		};
	});

	const chartData = contractorRows.map((r) => ({
		code: r.code,
		name: r.name,
		fuelRatio: r.fuelRatio,
		status: r.status as "Efisien" | "Optimal" | "Warning",
		loadingRatio: 0.2,
		haulingRatio: 0.7,
		supportingRatio: 0.19,
		dewateringRatio: 0.18,
	}));

	const overallRatio =
		contractorRows.length > 0
			? contractorRows.reduce((acc, curr) => acc + curr.fuelRatio, 0) / contractorRows.length
			: 0.24;

	const topContractor =
		contractorRows.length > 0 ? [...contractorRows].sort((a, b) => a.fuelRatio - b.fuelRatio)[0].name : "PT. A";

	const totalFuelLiters = contractorRows.reduce((acc, curr) => acc + curr.fuelConsLiters, 0) || 34200000;
	const totalMineBcm = contractorRows.reduce((acc, curr) => acc + curr.totalBcmProd, 0) || 142000000;

	return (
		<div className="dashboard-page">
			{/* Page Header */}
			<div className="page-header">
				<div>
					<div className="breadcrumb">
						<strong>Home</strong>
						<span>/</span>
						<span>Multi-contractor monitoring</span>
					</div>
					<div className="page-title-row">
						<div className="page-icon page-icon-overview">
							<Building2 size={22} />
						</div>
						<div>
							<h1>Monitoring multi kontraktor <span className="title-slash">/</span> fuel ratio</h1>
							<p>Performa & efisiensi fuel ratio seluruh kontraktor</p>
						</div>
					</div>
				</div>
			</div>

			{/* Global Contractor Filter Selector Bar */}
			<div className="panel" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem" }}>
				<div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
						<div className="page-icon" style={{ width: "2rem", height: "2rem" }}>
							<Filter size={16} />
						</div>
						<div>
							<strong style={{ fontSize: "0.8125rem" }}>Filter Perusahaan Kontraktor</strong>
							<p style={{ fontSize: "0.6875rem", opacity: 0.6, margin: 0 }}>
								Pilih kontraktor spesifik untuk memfilter metrik & laporan
							</p>
						</div>
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
						<select
							value={selectedContractor}
							onChange={(e) => setSelectedContractor(e.target.value)}
							style={{
								background: "var(--surface-0)",
								border: "1px solid var(--border)",
								color: "var(--text-primary)",
								fontSize: "0.75rem",
								fontWeight: 500,
								borderRadius: "0.5rem",
								padding: "0.5rem 1rem",
								minWidth: "16rem",
								cursor: "pointer",
							}}
						>
							<option value="ALL">All Contractors (PT. A - PT. J)</option>
							{contractorRows.map((c) => (
								<option key={c.code} value={c.code}>
									{c.code} — {c.name}
								</option>
							))}
						</select>

						<button
							onClick={loadData}
							className="outline-button"
							title="Refresh Live Data"
							style={{ padding: "0.5rem" }}
						>
							<RefreshCw size={14} className={loading ? "spin" : ""} />
						</button>
					</div>
				</div>
			</div>

			{/* KPI Summary Cards */}
			<ContractorOverviewCards
				selectedContractor={selectedContractor}
				totalContractors={contractorRows.length}
				overallFuelRatio={overallRatio}
				topEfficientContractor={topContractor}
				totalFuelLiters={totalFuelLiters}
				totalMineBcm={totalMineBcm}
			/>

			{/* Leaderboard Bar Chart & SPO Standard */}
			<ContractorLeaderboardChart
				contractors={chartData}
				selectedContractor={selectedContractor}
				onSelectContractor={setSelectedContractor}
			/>

			{/* Equipment Fleet Detail Matrix Section */}
			<ContractorEquipmentFleet
				selectedContractorCode={selectedContractor}
				selectedContractorName={
					selectedContractor === "ALL"
						? "Seluruh Kontraktor (PT. A - PT. J)"
						: contractorRows.find((c) => c.code === selectedContractor)?.name ||
							selectedContractor
				}
				equipments={
					selectedContractor === "ALL"
						? equipments
						: equipments.filter(
								(eq) =>
									eq.contractor_id ===
									contractors.find((c) => c.code === selectedContractor)?.id,
							)
				}
			/>

			{/* Drilldown Matrix Table */}
			<ContractorDetailTable
				data={contractorRows}
				selectedContractor={selectedContractor}
				onSelectContractor={setSelectedContractor}
			/>
		</div>
	);
}
