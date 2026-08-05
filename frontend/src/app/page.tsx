"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { ContractorFuelRatioDashboard } from "@/components/dashboard/ContractorFuelRatioDashboard";
import { Header } from "@/components/layout/Header";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(1);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-amber-200 selection:text-slate-900 lg:pl-72">
      <Header activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {activeFeature === 1 && <ContractorFuelRatioDashboard />}
        {activeFeature !== 1 && (
          <div className="mx-auto my-16 max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"><Layers className="h-7 w-7" /></div>
            <h2 className="text-xl font-bold text-white">Modul dalam pengembangan</h2>
            <p className="mt-2 text-xs text-slate-400">Pilih Monitoring Kontraktor untuk melihat dashboard Fuel Ratio.</p>
          </div>
        )}
      </main>
      <footer className="w-full border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500">Fuel Ratio Monitoring System (FRMS) Multi-Contractor Edition &copy; 2026 — Mine Energy &amp; Performance Analytics</footer>
    </div>
  );
}
