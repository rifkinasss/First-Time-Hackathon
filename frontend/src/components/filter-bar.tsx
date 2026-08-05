"use client";

import { type FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { CalendarDays, Check, Download, FileDown, Filter, RotateCcw } from "lucide-react";
import { DEFAULT_FILTERS, Filters, UnitRecord } from "@/lib/frms-types";
import { useFilterStore } from "@/lib/filters";

const filterSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  contractor: z.string(),
  unit: z.string(),
});

export function FilterBar({ contractors, units = [] }: { contractors: string[]; units?: UnitRecord[] }) {
  const filters = useFilterStore();
  const setFilters = useFilterStore((state) => state.setFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const [saved, setSaved] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Filters>({
    from: filters.from,
    to: filters.to,
    contractor: filters.contractor,
    unit: filters.unit,
  });
  const uniqueUnits = Array.from(new Set(units.map((row) => row.unitType)));

  useEffect(() => {
    setDraftFilters({
      from: filters.from,
      to: filters.to,
      contractor: filters.contractor,
      unit: filters.unit,
    });
  }, [filters.from, filters.to, filters.contractor, filters.unit]);

  const updateDraft = (field: keyof Filters, value: string) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = filterSchema.safeParse(draftFilters);
    if (result.success) setFilters(result.data);
  };


  const resetAll = () => {
    resetFilters();
    setDraftFilters(DEFAULT_FILTERS);
  };

  const exportCsv = () => {
    if (!units || units.length === 0) return;
    const headers = ["Unit Type", "Category", "Contractor", "Qty", "Fuel Cons (L/h)", "Productivity", "PA", "UA", "EWH", "Fuel Ratio", "SPO Target", "Variance (%)"];
    const rows = units.map(u => [
      `"${u.unitType}"`,
      `"${u.category ?? ""}"`,
      `"${u.contractor}"`,
      u.qty,
      u.fuelConsumption,
      u.productivity ?? "",
      u.PA ?? "",
      u.UA ?? "",
      u.EWH ?? "",
      u.fuelRatio,
      u.spoTarget,
      u.variancePct
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `frms_monitoring_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return <div className="filter-bar">
    <div className="filter-title"><Filter size={15} /><span>Scope</span><small>21 days</small></div>
    <form className="filter-form" onSubmit={submit}>
      <label><span>From</span><div className="input-wrap"><CalendarDays size={14} /><input type="date" value={draftFilters.from} onChange={(event) => updateDraft("from", event.target.value)} /></div></label>
      <span className="date-dash">—</span>
      <label><span>To</span><div className="input-wrap"><CalendarDays size={14} /><input type="date" value={draftFilters.to} onChange={(event) => updateDraft("to", event.target.value)} /></div></label>
      <label><span>Contractor</span><select value={draftFilters.contractor} onChange={(event) => updateDraft("contractor", event.target.value)}><option value="all">All contractors</option>{contractors.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label><span>Unit type</span><select value={draftFilters.unit} onChange={(event) => updateDraft("unit", event.target.value)}><option value="all">All unit types</option>{uniqueUnits.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <button type="submit" className="apply-button"><Check size={14} /> Apply</button>
    </form>
    <div className="filter-actions">
      <button className="text-button" onClick={resetAll}><RotateCcw size={13} /> Reset</button>
      <span className="filter-divider" />
      <button className="export-button" onClick={exportCsv} title="Export CSV Data">
        {saved ? <Check size={14} /> : <FileDown size={14} />}
        {saved ? "Downloaded" : "Excel / CSV"}
      </button>
      <button className="export-button" onClick={() => window.print()} title="Print / Export PDF">
        <Download size={14} /> PDF
      </button>
    </div>
  </div>;
}
