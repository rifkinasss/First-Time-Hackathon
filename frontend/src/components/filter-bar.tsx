"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarDays, Check, Download, FileDown, Filter, RotateCcw } from "lucide-react";
import { Filters, UnitRecord } from "@/lib/frms-types";
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
  const { register, handleSubmit, reset } = useForm<Filters>({ defaultValues: filters });
  const uniqueUnits = Array.from(new Set(units.map((row) => row.unitType)));

  useEffect(() => { reset(filters); }, [filters, reset]);

  const submit = (values: Filters) => {
    const result = filterSchema.safeParse(values);
    if (result.success) setFilters(result.data);
  };

  const resetAll = () => { resetFilters(); reset({ from: "2026-07-01", to: "2026-07-21", contractor: "all", unit: "all" }); };
  const exportCsv = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return <div className="filter-bar">
    <div className="filter-title"><Filter size={15} /><span>Scope</span><small>21 days</small></div>
    <form className="filter-form" onSubmit={handleSubmit(submit)}>
      <label><span>From</span><div className="input-wrap"><CalendarDays size={14} /><input type="date" {...register("from")} /></div></label>
      <span className="date-dash">—</span>
      <label><span>To</span><div className="input-wrap"><CalendarDays size={14} /><input type="date" {...register("to")} /></div></label>
      <label><span>Contractor</span><select {...register("contractor")}><option value="all">All contractors</option>{contractors.map((item) => <option key={item} value={item}>{item.replace("PT ", "")}</option>)}</select></label>
      <label><span>Unit type</span><select {...register("unit")}><option value="all">All unit types</option>{uniqueUnits.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <button type="submit" className="apply-button"><Check size={14} /> Apply</button>
    </form>
    <div className="filter-actions"><button className="text-button" onClick={resetAll}><RotateCcw size={13} /> Reset</button><span className="filter-divider" /><button className="export-button" onClick={exportCsv}>{saved ? <Check size={14} /> : <FileDown size={14} />}{saved ? "Ready" : "Excel"}</button><button className="export-button" onClick={() => window.print()}><Download size={14} /> PDF</button></div>
  </div>;
}
