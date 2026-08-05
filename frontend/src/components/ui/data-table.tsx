"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export type SortDirection = "asc" | "desc";

export function DataTableSearch({ value, onChange, placeholder = "Cari data..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="relative block w-full sm:w-60"><Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" /><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-9 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" /></label>;
}

export function SortableHeader({ label, active, direction, onClick, align = "left" }: { label: string; active: boolean; direction: SortDirection; onClick: () => void; align?: "left" | "right" | "center" }) {
  const Icon = active ? (direction === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  const justify = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return <button type="button" onClick={onClick} className={`group inline-flex w-full items-center gap-1 font-bold transition hover:text-slate-700 ${justify}`}><span>{label}</span><Icon className={`size-3 transition ${active ? "text-blue-600" : "text-slate-300 group-hover:text-slate-500"}`} /></button>;
}

export function DataTablePagination({ page, pageCount, total, pageSize, onPageChange }: { page: number; pageCount: number; total: number; pageSize: number; onPageChange: (page: number) => void }) {
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const from = total ? (safePage - 1) * pageSize + 1 : 0;
  const to = Math.min(safePage * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter((value) => pageCount <= 5 || value === 1 || value === pageCount || Math.abs(value - safePage) <= 1);
  return <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row"><p className="text-xs text-slate-500">{total ? <>Menampilkan <span className="font-semibold text-slate-700">{from}–{to}</span> dari <span className="font-semibold text-slate-700">{total}</span> data</> : "Tidak ada data"}</p><Pagination className="mx-0 w-auto"><PaginationContent><PaginationItem><PaginationPrevious href="#" text="Sebelumnya" onClick={(event) => { event.preventDefault(); onPageChange(Math.max(1, safePage - 1)); }} className={safePage === 1 ? "pointer-events-none opacity-40" : undefined} /></PaginationItem>{pages.map((value, index) => <span key={value} className="contents">{index > 0 && value - pages[index - 1] > 1 && <span className="px-1 text-xs text-slate-400">…</span>}<PaginationItem><PaginationLink href="#" isActive={safePage === value} onClick={(event) => { event.preventDefault(); onPageChange(value); }}>{value}</PaginationLink></PaginationItem></span>)}<PaginationItem><PaginationNext href="#" text="Berikutnya" onClick={(event) => { event.preventDefault(); onPageChange(Math.min(pageCount, safePage + 1)); }} className={safePage === pageCount ? "pointer-events-none opacity-40" : undefined} /></PaginationItem></PaginationContent></Pagination></div>;
}
