"use client";

import { ArrowRight, BookOpen, CircleHelp, ShieldAlert } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";

const rules = [
  { code: "R1", title: "Produktivitas naik", condition: "Produktivitas tinggi", result: "Risiko turun", tone: "emerald", reason: "Volume BCM yang dihasilkan lebih baik terhadap waktu dan unit yang digunakan.", action: "Pertahankan utilisasi unit dan pantau agar konsumsi bahan bakar tidak meningkat." },
  { code: "R2", title: "Populasi unit naik", condition: "Populasi unit pendukung + pengeringan tinggi", result: "Risiko naik", tone: "rose", reason: "Lebih banyak unit non-produktif dapat menaikkan konsumsi tanpa menambah BCM langsung.", action: "Tinjau kebutuhan unit, utilisasi, dan jadwal kerja unit pendukung/pengeringan." },
  { code: "R3", title: "Deviasi bahan bakar naik", condition: "Konsumsi aktual di atas acuan", result: "Risiko naik", tone: "rose", reason: "Rasio konsumsi bahan bakar aktual terhadap referensi berada di atas rentang normal.", action: "Validasi pengisian, jam operasi, idle time, dan kondisi alat." },
  { code: "R4", title: "Produktivitas rendah dan populasi tinggi", condition: "Produktivitas rendah DAN populasi unit tinggi", result: "Risiko naik", tone: "rose", reason: "Kombinasi output rendah dan unit pendukung banyak berpotensi membengkakkan rasio bahan bakar.", action: "Prioritaskan pemulihan produktivitas, lalu sesuaikan jumlah unit pendukung." },
  { code: "R5", title: "Produktivitas rendah dan konsumsi tinggi", condition: "Produktivitas rendah DAN deviasi bahan bakar tinggi", result: "Risiko naik", tone: "rose", reason: "Bahan bakar meningkat ketika output BCM tidak sebanding.", action: "Periksa waktu tunggu, kondisi jalan, pola kerja, dan performa peralatan." },
  { code: "R6", title: "Operasi normal", condition: "Produktivitas, populasi, dan bahan bakar normal", result: "Risiko normal", tone: "amber", reason: "Indikator utama berada dalam rentang operasional yang diharapkan.", action: "Lanjutkan pemantauan dan bandingkan dengan periode berikutnya." },
  { code: "R7", title: "Operasi optimal", condition: "Produktivitas tinggi, populasi rendah, bahan bakar rendah", result: "Risiko rendah", tone: "emerald", reason: "Output baik dicapai dengan kebutuhan unit dan bahan bakar yang lebih efisien.", action: "Jadikan konfigurasi operasi ini sebagai referensi praktik baik." },
] as const;

const toneClass = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
};

export function FuzzyRuleGuideClient() {
  return <DashboardShell activeFeature={10}>
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Panduan Sistem</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Aturan Risiko Fuzzy</h2><p className="mt-1 max-w-3xl text-sm text-slate-500">Arti kode aturan yang muncul pada halaman risiko kontraktor, beserta alasan dan tindak lanjut operasionalnya.</p></div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"><BookOpen className="size-4" />7 aturan aktif</span>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CircleHelp className="size-5 text-blue-600" /><h3 className="mt-3 font-bold text-slate-950">Cara membaca aturan</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">Setiap aturan memakai pola <strong>jika kondisi terpenuhi, maka tingkat risiko berubah</strong>. Aturan dengan kekuatan paling besar tampil sebagai aturan dominan pada kontraktor.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ShieldAlert className="size-5 text-rose-600" /><h3 className="mt-3 font-bold text-slate-950">Arti populasi unit</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">Populasi adalah jumlah unit <strong>pendukung dan pengeringan</strong>. Indikator ini dipantau karena keduanya menyerap bahan bakar tanpa menghasilkan BCM utama secara langsung.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ArrowRight className="size-5 text-amber-600" /><h3 className="mt-3 font-bold text-slate-950">Dasar penilaian</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">Produktivitas dan populasi dibandingkan dengan sebaran data kontraktor. Deviasi bahan bakar membandingkan konsumsi aktual dengan acuan; nilai di atas acuan meningkatkan risiko.</p></div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">{rules.map((rule) => <article key={rule.code} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className={`inline-flex size-11 items-center justify-center rounded-xl border text-sm font-extrabold ${toneClass[rule.tone]}`}>{rule.code}</span><div><h3 className="font-bold text-slate-950">{rule.title}</h3><p className="mt-0.5 text-xs text-slate-500">{rule.condition}</p></div></div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${toneClass[rule.tone]}`}>{rule.result}</span></div><div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mengapa penting</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{rule.reason}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tindakan disarankan</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{rule.action}</p></div></div></article>)}</section>

      <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-950"><p className="font-bold">Catatan perhitungan</p><p className="mt-1 leading-relaxed text-violet-800">Sistem memakai inferensi Mamdani: kondisi gabungan memakai nilai minimum, hasil antar aturan digabungkan dengan nilai maksimum, lalu skor risiko dihitung menggunakan metode centroid. Skor ≤ 0,35 adalah rendah, &gt; 0,35 sampai 0,65 normal, dan &gt; 0,65 tinggi.</p></section>
    </div>
  </DashboardShell>;
}
