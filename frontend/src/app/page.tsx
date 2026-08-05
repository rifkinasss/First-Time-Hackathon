"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { ContractorOverviewCards } from "@/components/dashboard/ContractorOverviewCards";
import { ContractorLeaderboardChart } from "@/components/dashboard/ContractorLeaderboardChart";
import { ContractorEquipmentFleet } from "@/components/dashboard/ContractorEquipmentFleet";
import { ContractorDetailTable, ContractorDetailRow } from "@/components/dashboard/ContractorDetailTable";
import { fetchContractors, fetchEquipment, Contractor, Equipment } from "@/lib/api";
import { Filter, RefreshCw, Layers } from "lucide-react";

export default function Home() {
	const [activeFeature, setActiveFeature] = useState<number>(1);
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
		<div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-slate-950">
			{/* Top Application Header & Feature Switcher */}
			<Header activeFeature={activeFeature} setActiveFeature={setActiveFeature} />

			{/* Main Content Area */}
			<main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
				{/* Render Feature 1: Sistem Monitoring Fuel Ratio Multi Kontraktor */}
				{activeFeature === 1 && (
					<div>
						{/* Global Contractor Filter Selector Bar */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6 shadow-xl backdrop-blur-md">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
									<Filter className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-white">Filter Perusahaan Kontraktor</h3>
									<p className="text-xs text-slate-400">
										Pilih kontraktor spesifik untuk memfilter metrik & laporan
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 w-full sm:w-auto">
								<select
									value={selectedContractor}
									onChange={(e) => setSelectedContractor(e.target.value)}
									className="bg-slate-950 border border-slate-700 text-white font-medium text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-64 cursor-pointer"
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
									className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
									title="Refresh Live Data"
								>
									<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
								</button>
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
				)}

				{/* Feature 2 Placeholder */}
				{activeFeature === 2 && (
					<div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-xl mx-auto my-16">
						<div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
							<Layers className="h-7 w-7" />
						</div>
						<h2 className="text-xl font-bold text-white">
							Feature 2: Monitoring Konsumsi Fuel Berbasis Aktivitas
						</h2>
						<p className="text-xs text-slate-400 mt-2">
							Modul ini akan difokuskan pada pemantauan rinci berbasis volume, BCM, dan working hours pada
							fase pengembangan selanjutnya.
						</p>
					</div>
				)}

				{/* Feature 3 Placeholder */}
				{activeFeature === 3 && (
					<div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-xl mx-auto my-16">
						<div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
							<Layers className="h-7 w-7" />
						</div>
						<h2 className="text-xl font-bold text-white">
							Feature 3: Penyelarasan Fuel Ratio dengan SPO & Target
						</h2>
						<p className="text-xs text-slate-400 mt-2">
							Modul ini akan difokuskan pada evaluasi otomatis terhadap Standar Parameter Operasi dan
							Target Produksi.
						</p>
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="w-full bg-slate-950 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-400">
				Fuel Ratio Monitoring System (FRMS) Multi-Contractor Edition &copy; 2026 — Mine Energy & Performance
				Analytics
			</footer>
		</div>
	);
}
