"use client";

import { FormEvent, useState } from "react";
import { Bell, Command, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  activeFeature: number;
}

const pageMeta: Record<number, { title: string; description: string }> = {
  0: {
    title: "Ringkasan",
    description: "Ringkasan kinerja rasio bahan bakar multi-kontraktor",
  },
  1: {
    title: "Rasio Bahan Bakar Multi-Kontraktor",
    description: "Kinerja kontraktor dan analisis risiko fuzzy",
  },
  2: {
    title: "Konsumsi Berdasarkan Aktivitas",
    description: "Pantau volume, BCM, dan jam kerja operasional",
  },
  3: {
    title: "SPO & Target Produksi",
    description: "Penyelarasan parameter operasi dan target produksi",
  },
  4: {
    title: "Master Kontraktor",
    description: "Kelola perusahaan kontraktor untuk data operasional",
  },
  5: {
    title: "Master Peralatan",
    description: "Kelola armada dan relasi aktivitas kontraktor",
  },
  6: {
    title: "Input Rasio Bahan Bakar",
    description: "Catat transaksi pemuatan, pengangkutan, pendukung, dan pengeringan tambang",
  },
  7: {
    title: "Master Referensi Bahan Bakar",
    description: "Kelola acuan konsumsi bahan bakar OEM per aktivitas",
  },
  8: {
    title: "Detail Pemantauan",
    description: "Telusuri rasio bahan bakar per aktivitas, unit, dan kontraktor",
  },
  9: {
    title: "Kinerja Kontraktor",
    description: "Evaluasi performa dan risiko fuzzy kontraktor",
  },
  10: {
    title: "Panduan Aturan Risiko",
    description: "Penjelasan aturan fuzzy untuk evaluasi operasional",
  },
};

export function AppHeader({ activeFeature }: AppHeaderProps) {
  const currentPage = pageMeta[activeFeature] ?? pageMeta[1];
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (term) router.push(`/monitoring-detail?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger />
          <div className="min-w-0">

          <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{currentPage.title}</h1>
          <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">{currentPage.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <form onSubmit={submitSearch} className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 md:flex">
            <Search className="size-4" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kontraktor atau unit" className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
            <span className="hidden items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 lg:flex"><Command className="size-2.5" />K</span>
          </form>

          <button type="button" title="Perbarui data" onClick={() => window.location.reload()} className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">
            <RefreshCw className="size-4" />
          </button>
          <button type="button" title="Notifikasi" className="relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          <div className="hidden h-9 w-px bg-slate-200 sm:block" />
          <button type="button" className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-slate-50">
            <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm">SA</span>
            <span className="hidden lg:block">
              <span className="block text-xs font-bold text-slate-800">Analis Lokasi</span>
              <span className="block text-[10px] text-slate-400">Operasional</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
