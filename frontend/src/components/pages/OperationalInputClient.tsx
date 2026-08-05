"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, Calculator, CheckCircle2, Droplets, Fuel, LoaderCircle, RefreshCw, Truck, Warehouse } from "lucide-react";
import {
  calculateDewatering,
  calculateDewateringAll,
  calculateHauling,
  calculateLoading,
  calculateSupporting,
  calculateSupportingAll,
  fetchContractors,
  fetchEquipment,
  fetchFuelReferences,
  fetchHaulingDistanceReferences,
} from "@/lib/api";
import type { Contractor, Equipment, FuelReference, HaulingDistanceReference, OperationalActivity, OperationalCalculation, OperationalBatchCalculation } from "@/types/api";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { toast } from "@/components/ui/toast";

const activityMeta: Record<OperationalActivity, { label: string; description: string; icon: typeof Warehouse; accent: string; defaults: Pick<FormState, "pa" | "ua" | "ewh"> }> = {
  loading: { label: "Loading", description: "Hitung dari unit dan acuan fuel yang dipilih.", icon: Warehouse, accent: "text-amber-600", defaults: { pa: "", ua: "", ewh: "" } },
  hauling: { label: "Hauling", description: "Gunakan jarak angkut untuk menentukan acuan produktivitas.", icon: Truck, accent: "text-cyan-600", defaults: { pa: "", ua: "", ewh: "" } },
  supporting: { label: "Supporting", description: "Masukkan availability, jam kerja, dan produksi tambang.", icon: Activity, accent: "text-violet-600", defaults: { pa: "0.90", ua: "0.53", ewh: "4121" } },
  dewatering: { label: "Dewatering", description: "Masukkan availability, jam kerja, dan produksi tambang.", icon: Droplets, accent: "text-emerald-600", defaults: { pa: "0.90", ua: "0.63", ewh: "4899" } },
};

type FormState = {
  unitType: string;
  fuelType: string;
  distanceKm: string;
  pa: string;
  ua: string;
  ewh: string;
  totalMineProdBcm: string;
  actualFuel: string;
  operatingHours: string;
};

const createForm = (activity: OperationalActivity): FormState => ({
  unitType: "",
  fuelType: "",
  distanceKm: "3.9",
  ...activityMeta[activity].defaults,
  totalMineProdBcm: "91276500",
  actualFuel: "",
  operatingHours: "",
});

const formatNumber = (value: number) => value.toLocaleString("id-ID", { maximumFractionDigits: 2 });

function NumericField({ label, value, onChange, hint, required = true, step = "any" }: { label: string; value: string; onChange: (value: string) => void; hint?: string; required?: boolean; step?: string }) {
  return <label className="block"><span className="text-xs font-semibold text-slate-700">{label}</span><input type="number" min="0" step={step} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" />{hint && <span className="mt-1 block text-[10px] text-slate-400">{hint}</span>}</label>;
}

function ResultCard({ result }: { result: OperationalCalculation }) {
  const summary = result.summary;
  const fuel = summary?.fuel_cons_actual ?? summary?.total_fuel_liters ?? summary?.fuel_cons;
  const production = summary?.total_mine_prod_bcm ?? summary?.productivity;
  const fuelRatio = summary?.fuel_ratio_actual ?? summary?.fuel_ratio;

  return <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-5" /></span><div><p className="text-sm font-bold text-emerald-900">Kalkulasi berhasil disimpan</p><p className="mt-1 text-xs text-emerald-700">Transaksi #{result.id} sudah masuk ke summary monitoring.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-emerald-100 bg-white/80 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuel Ratio</p><p className="mt-1 font-mono text-lg font-bold text-slate-900">{fuelRatio === undefined || fuelRatio === null ? "—" : `${fuelRatio.toFixed(3)} L/BCM`}</p></div><div className="rounded-xl border border-emerald-100 bg-white/80 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuel</p><p className="mt-1 font-mono text-lg font-bold text-slate-900">{fuel === undefined || fuel === null ? "—" : `${formatNumber(fuel)} L`}</p></div><div className="rounded-xl border border-emerald-100 bg-white/80 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Produksi</p><p className="mt-1 font-mono text-lg font-bold text-slate-900">{production === undefined || production === null ? "—" : `${formatNumber(production)} BCM`}</p></div></div>{summary?.data_source && <p className="mt-3 text-[11px] font-semibold text-emerald-800">Sumber kalkulasi: {summary.data_source.replaceAll("_", " ")}</p>}</section>;
}

function BatchCalculationPanel({ activity, form, contractorId }: { activity: "supporting" | "dewatering"; form: FormState; contractorId: number | null }) {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<OperationalBatchCalculation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setSaving(true); setError(null);
    try {
      if (!contractorId) throw new Error("Pilih perusahaan sebelum menjalankan kalkulasi batch.");
      const payload = { contractor_id: contractorId, pa: Number(form.pa), ua: Number(form.ua), ewh: Number(form.ewh), total_mine_prod_bcm: Number(form.totalMineProdBcm), ...(form.actualFuel ? { fuel_consumed_liters: Number(form.actualFuel) } : {}), ...(form.operatingHours ? { operating_hours: Number(form.operatingHours) } : {}) };
      const data = activity === "supporting" ? await calculateSupportingAll(payload) : await calculateDewateringAll(payload);
      setResult(data);
      toast.add({ type: "success", title: `Batch ${activity} selesai`, description: `${data.total_units_processed} unit diproses dan disimpan.` });
    } catch (cause) { const detail = cause instanceof Error ? cause.message : "Kalkulasi batch gagal diproses."; setError(detail); toast.add({ type: "error", title: "Kalkulasi batch gagal", description: detail }); }
    finally { setSaving(false); }
  };
  return <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5 shadow-sm"><h3 className="text-sm font-bold text-violet-950">Kalkulasi batch {activity}</h3><p className="mt-1 text-xs leading-relaxed text-violet-800">Gunakan parameter di formulir untuk menghitung seluruh unit {activity} milik perusahaan yang dipilih saja.</p><button type="button" onClick={() => void run()} disabled={saving || !contractorId} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">{saving ? <LoaderCircle className="size-3.5 animate-spin" /> : <Calculator className="size-3.5" />}Hitung semua unit {activity}</button>{result && <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white p-2"><p className="text-[9px] font-bold uppercase text-slate-400">Unit</p><p className="mt-1 font-mono text-xs font-bold text-slate-800">{result.total_units_processed}</p></div><div className="rounded-xl bg-white p-2"><p className="text-[9px] font-bold uppercase text-slate-400">Fuel</p><p className="mt-1 font-mono text-xs font-bold text-slate-800">{formatNumber(result.total_fuel_liters)} L</p></div><div className="rounded-xl bg-white p-2"><p className="text-[9px] font-bold uppercase text-slate-400">FR</p><p className="mt-1 font-mono text-xs font-bold text-slate-800">{result.overall_fuel_ratio.toFixed(3)}</p></div></div>}{error && <p className="mt-3 text-xs font-semibold text-rose-700">{error}</p>}</section>;
}

function HaulingReferenceCard({ references, distance }: { references: HaulingDistanceReference[]; distance: string }) {
  const requested = Number(distance);
  const closest = references.reduce<HaulingDistanceReference | null>((best, row) => !best || Math.abs(row.km - requested) < Math.abs(best.km - requested) ? row : best, null);
  return <section className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 shadow-sm"><h3 className="text-sm font-bold text-cyan-950">Acuan jarak hauling</h3>{closest ? <><p className="mt-1 text-xs text-cyan-800">Referensi terdekat untuk jarak {requested || 0} km.</p><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white p-2"><p className="text-[9px] font-bold uppercase text-slate-400">Jarak</p><p className="mt-1 font-mono text-xs font-bold text-slate-800">{closest.km} km</p></div><div className="rounded-xl bg-white p-2"><p className="text-[9px] font-bold uppercase text-slate-400">Cycle</p><p className="mt-1 font-mono text-xs font-bold text-slate-800">{closest.cycle_time} min</p></div><div className="rounded-xl bg-white p-2"><p className="text-[9px] font-bold uppercase text-slate-400">Produktivitas</p><p className="mt-1 font-mono text-xs font-bold text-slate-800">{closest.bcm_per_hr} BCM/hr</p></div></div></> : <p className="mt-2 text-xs text-cyan-800">Belum ada tabel acuan jarak dari backend.</p>}</section>;
}

export function OperationalInputClient() {
  const [activeActivity, setActiveActivity] = useState<OperationalActivity>("loading");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [fuelReferences, setFuelReferences] = useState<FuelReference[]>([]);
  const [haulingReferences, setHaulingReferences] = useState<HaulingDistanceReference[]>([]);
  const [form, setForm] = useState<FormState>(() => createForm("loading"));
  const [result, setResult] = useState<OperationalCalculation | null>(null);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMasterData = async () => {
    setLoadingMaster(true);
    setError(null);
    try {
      const [contractorData, equipmentData, fuelData, haulingData] = await Promise.all([fetchContractors(), fetchEquipment(), fetchFuelReferences(), fetchHaulingDistanceReferences()]);
      setContractors(contractorData);
      setEquipment(equipmentData);
      setFuelReferences(fuelData);
      setHaulingReferences(haulingData);
      setSelectedContractorId((current) => current && contractorData.some((item) => item.id === current) ? current : contractorData[0]?.id ?? null);
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Master equipment atau fuel reference tidak dapat dimuat.";
      setError(detail);
      toast.add({ type: "error", title: "Master data belum siap", description: detail });
    } finally {
      setLoadingMaster(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMasterData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const equipmentOptions = useMemo(() => equipment.filter((item) => item.activity.toLowerCase() === activeActivity && item.contractor_id === selectedContractorId), [activeActivity, equipment, selectedContractorId]);
  const matchingFuelReferences = useMemo(() => {
    const filtered = fuelReferences.filter((item) => item.activity.toLowerCase() === activeActivity);
    return filtered.length ? filtered : fuelReferences;
  }, [activeActivity, fuelReferences]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResult(null);
      setForm((current) => ({
        ...createForm(activeActivity),
        unitType: equipmentOptions.some((item) => item.unit_type === current.unitType) ? current.unitType : equipmentOptions[0]?.unit_type ?? "",
        fuelType: matchingFuelReferences.some((item) => item.type === current.fuelType) ? current.fuelType : matchingFuelReferences[0]?.type ?? "",
      }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeActivity, equipmentOptions, matchingFuelReferences]);

  const selectedContractor = contractors.find((item) => item.id === selectedContractorId);
  const selectedEquipment = equipmentOptions.find((item) => item.unit_type === form.unitType);
  const selectedFuelReference = matchingFuelReferences.find((item) => item.type === form.fuelType);
  const canSubmit = Boolean(selectedContractor && selectedEquipment && selectedFuelReference);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !selectedEquipment || !selectedFuelReference) {
      setError("Pilih perusahaan, unit equipment, dan fuel reference yang sesuai terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let calculation: OperationalCalculation;
      if (activeActivity === "loading") {
        calculation = await calculateLoading({
          equipment_id: selectedEquipment.id,
          fuel_reference_id: selectedFuelReference.id,
          ...(form.actualFuel ? { fuel_consumed_liters: Number(form.actualFuel) } : {}),
          ...(form.operatingHours ? { operating_hours: Number(form.operatingHours) } : {}),
        });
      } else if (activeActivity === "hauling") {
        calculation = await calculateHauling({ equipment_id: selectedEquipment.id, fuel_reference_id: selectedFuelReference.id, distance_km: Number(form.distanceKm) });
      } else {
        const operatingInput = {
          equipment_id: selectedEquipment.id,
          fuel_reference_id: selectedFuelReference.id,
          pa: Number(form.pa),
          ua: Number(form.ua),
          ewh: Number(form.ewh),
          total_mine_prod_bcm: Number(form.totalMineProdBcm),
          ...(form.actualFuel ? { fuel_consumed_liters: Number(form.actualFuel) } : {}),
          ...(form.operatingHours ? { operating_hours: Number(form.operatingHours) } : {}),
        };
        calculation = activeActivity === "supporting"
          ? await calculateSupporting(operatingInput)
          : await calculateDewatering(operatingInput);
      }
      setResult(calculation);
      toast.add({ type: "success", title: "Fuel Ratio dihitung", description: `Transaksi ${activityMeta[activeActivity].label} berhasil disimpan.` });
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "Kalkulasi Fuel Ratio gagal diproses.";
      setError(detail);
      toast.add({ type: "error", title: "Kalkulasi gagal", description: detail });
    } finally {
      setSubmitting(false);
    }
  };

  const meta = activityMeta[activeActivity];

  return <DashboardShell activeFeature={6}><div className="space-y-6"><section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Input Operasional</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Input Fuel Ratio</h2><p className="mt-1 text-sm text-slate-500">Catat transaksi operasional dan simpan hasil perhitungan Fuel Ratio ke monitoring.</p></div><button type="button" onClick={() => void loadMasterData()} disabled={loadingMaster} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"><RefreshCw className={`size-3.5 ${loadingMaster ? "animate-spin" : ""}`} />Perbarui master</button></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(Object.keys(activityMeta) as OperationalActivity[]).map((activity) => { const item = activityMeta[activity]; const Icon = item.icon; const active = activity === activeActivity; return <button key={activity} type="button" onClick={() => setActiveActivity(activity)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"}`}><Icon className={`size-5 ${active ? "text-blue-600" : item.accent}`} /><p className="mt-3 text-sm font-bold text-slate-900">{item.label}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.description}</p></button>; })}</section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]"><form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-6 flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Calculator className="size-5" /></span><div><h3 className="text-base font-bold text-slate-950">Input {meta.label}</h3><p className="mt-1 text-xs text-slate-500">Pilih perusahaan terlebih dahulu, lalu pilih unit dan fuel reference yang sesuai.</p></div></div>{loadingMaster ? <div className="flex h-64 items-center justify-center"><LoaderCircle className="size-6 animate-spin text-blue-500" /></div> : <div className="space-y-4"><label className="block"><span className="text-xs font-semibold text-slate-700">Perusahaan / kontraktor</span><select required value={selectedContractorId ?? ""} onChange={(event) => setSelectedContractorId(Number(event.target.value))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"><option value="" disabled>Pilih perusahaan</option>{contractors.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.company_name}</option>)}</select><span className="mt-1 block text-[10px] text-slate-400">Equipment dan transaksi akan dikaitkan ke perusahaan ini melalui relasi master equipment.</span></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-semibold text-slate-700">Unit equipment</span><select required value={form.unitType} onChange={(event) => setForm({ ...form, unitType: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"><option value="" disabled>Pilih unit</option>{equipmentOptions.map((item) => <option key={item.id} value={item.unit_type}>{item.unit_type} · {item.item}</option>)}</select>{equipmentOptions.length === 0 && <span className="mt-1 block text-[10px] text-rose-600">Belum ada equipment {meta.label} untuk {selectedContractor?.company_name ?? "perusahaan ini"}.</span>}</label><label className="block"><span className="text-xs font-semibold text-slate-700">Fuel reference</span><select required value={form.fuelType} onChange={(event) => setForm({ ...form, fuelType: event.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"><option value="" disabled>Pilih fuel reference</option>{matchingFuelReferences.map((item) => <option key={item.id} value={item.type}>{item.type} · {item.merk} ({item.average} L/hr)</option>)}</select>{matchingFuelReferences.length === 0 && <span className="mt-1 block text-[10px] text-rose-600">Belum ada fuel reference tersedia.</span>}</label></div>
      {activeActivity === "hauling" && <NumericField label="Jarak angkut (km)" value={form.distanceKm} onChange={(value) => setForm({ ...form, distanceKm: value })} hint="Backend menggunakan jarak untuk memilih acuan produktivitas hauling." />}
      {(activeActivity === "supporting" || activeActivity === "dewatering") && <><div className="grid gap-4 sm:grid-cols-3"><NumericField label="PA" value={form.pa} onChange={(value) => setForm({ ...form, pa: value })} hint="Contoh: 0.90 = 90%" /><NumericField label="UA" value={form.ua} onChange={(value) => setForm({ ...form, ua: value })} hint="Contoh: 0.53 = 53%" /><NumericField label="EWH (jam)" value={form.ewh} onChange={(value) => setForm({ ...form, ewh: value })} /></div><NumericField label="Total produksi tambang (BCM)" value={form.totalMineProdBcm} onChange={(value) => setForm({ ...form, totalMineProdBcm: value })} /><div className="grid gap-4 sm:grid-cols-2"><NumericField label="Fuel aktual (liter)" value={form.actualFuel} onChange={(value) => setForm({ ...form, actualFuel: value })} required={false} hint="Opsional. Kosongkan untuk memakai acuan OEM." /><NumericField label="Jam operasi aktual" value={form.operatingHours} onChange={(value) => setForm({ ...form, operatingHours: value })} required={false} hint="Opsional, diisi bersama fuel aktual." /></div></>}
      {activeActivity === "loading" && <><div className="grid gap-4 sm:grid-cols-2"><NumericField label="Fuel aktual (liter)" value={form.actualFuel} onChange={(value) => setForm({ ...form, actualFuel: value })} required={false} hint="Opsional. Isi bersama jam operasi untuk memakai data aktual." /><NumericField label="Jam operasi aktual" value={form.operatingHours} onChange={(value) => setForm({ ...form, operatingHours: value })} required={false} hint="Opsional. Kosongkan keduanya untuk memakai acuan OEM." /></div><div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">Bila fuel aktual dan jam operasi diisi, sistem menyimpan Fuel Ratio berbasis data aktual. Bila dikosongkan, sistem menggunakan acuan OEM dari master fuel reference.</div></>}
      <button type="submit" disabled={submitting || !form.unitType || !form.fuelType} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Fuel className="size-4" />}Hitung &amp; simpan Fuel Ratio</button></div>}</form>
      <aside className="space-y-4">
        {result ? <ResultCard result={result} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center"><span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Fuel className="size-5" /></span><h3 className="mt-4 text-sm font-bold text-slate-800">Hasil kalkulasi akan tampil di sini</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Submit input operasional untuk menyimpan transaksi dan memperbarui dashboard monitoring.</p></div>}
        {activeActivity === "hauling" && <HaulingReferenceCard references={haulingReferences} distance={form.distanceKm} />}
        {(activeActivity === "supporting" || activeActivity === "dewatering") && <BatchCalculationPanel activity={activeActivity} form={form} contractorId={selectedContractorId} />}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-sm font-bold text-slate-900">Alur input</h3><ol className="mt-3 space-y-3 text-xs text-slate-600"><li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">1</span>Pilih unit sesuai aktivitas operasional.</li><li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">2</span>Pilih fuel reference yang sesuai unit.</li><li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">3</span>Lengkapi parameter operasional jika diminta.</li><li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">4</span>Simpan, lalu cek hasil pada Konsumsi Fuel Aktivitas.</li></ol></div>
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">{error}</div>}
      </aside>
    </section>
  </div></DashboardShell>;
}
