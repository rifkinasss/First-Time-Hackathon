"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { Building2, Activity, Target, Fuel, Moon, Sun } from "lucide-react";

interface HeaderProps {
  activeFeature: number;
  setActiveFeature: (featureId: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeFeature, setActiveFeature }) => {
  const isDark = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("frms-theme-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("frms-theme-change", onStoreChange);
      };
    },
    () => localStorage.getItem("frms-theme") === "dark",
    () => false
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const setTheme = (theme: "light" | "dark") => {
    localStorage.setItem("frms-theme", theme);
    window.dispatchEvent(new Event("frms-theme-change"));
  };

  const features = [
    { id: 1, title: "Monitoring Kontraktor", subtitle: "Performa dan fuel ratio", icon: Building2 },
    { id: 2, title: "Konsumsi Berdasarkan Aktivitas", subtitle: "Volume, BCM, dan jam kerja", icon: Activity },
    { id: 3, title: "SPO dan Target", subtitle: "Parameter operasi dan produksi", icon: Target },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
            <Fuel className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">Fuel Ratio Monitoring</h1>
            <p className="mt-0.5 text-xs text-slate-500">Operasional tambang</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Navigasi utama">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
              <span>
                <span className="block text-sm font-semibold">{feature.title}</span>
                <span className="mt-0.5 block text-xs font-normal text-slate-500">{feature.subtitle}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="m-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Sistem terhubung
        </div>
        <p className="mt-1 text-[11px] text-slate-500">Data diperbarui dari server lokal.</p>
      </div>

      <div className="border-t border-slate-200 px-3 py-3">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm" aria-label="Pilihan tema">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-bold text-slate-900">Tampilan</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Pilih tema yang nyaman</p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </span>
          </div>

          <div className="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1" role="group" aria-label="Mode tampilan">
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={!isDark}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 ${
                !isDark
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              Terang
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={isDark}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 ${
                isDark
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Gelap
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
};
