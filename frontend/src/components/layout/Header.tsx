"use client";

import React from "react";
import { Building2, Activity, Target, Fuel } from "lucide-react";

interface HeaderProps {
  activeFeature: number;
  setActiveFeature: (featureId: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeFeature, setActiveFeature }) => {
  const features = [
    {
      id: 1,
      title: "Monitoring Multi Kontraktor",
      subtitle: "Performa & Efisiensi Fuel Ratio PT. A - J",
      icon: Building2,
      activeColor: "border-amber-500 bg-amber-500/10 text-amber-400",
      badge: "Active Feature",
    },
    {
      id: 2,
      title: "Konsumsi Fuel Berbasis Aktivitas",
      subtitle: "Monitoring Volume / BCM / Working Hours",
      icon: Activity,
      activeColor: "border-cyan-500 bg-cyan-500/10 text-cyan-400",
      badge: "Module 2",
    },
    {
      id: 3,
      title: "Penyelarasan SPO & Target",
      subtitle: "Evaluasi Parameter Operasi & Target Produksi",
      icon: Target,
      activeColor: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
      badge: "Module 3",
    },
  ];

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Fuel className="h-6 w-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Fuel Ratio Monitoring System
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-mono">
                v2.0 Multi-Contractor
              </span>
            </h1>
            <p className="text-xs text-slate-400">Mine Operations & Energy Efficiency Dashboard</p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>FastAPI Live: <strong>http://127.0.0.1:8000</strong></span>
        </div>
      </div>

      {/* 3 Main Feature Cards Navigation */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? `${feature.activeColor} shadow-md shadow-amber-500/5`
                  : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/50"
              }`}
            >
              <div className={`p-2.5 rounded-lg ${isActive ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-300"}`}>
                    {feature.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{feature.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
};
