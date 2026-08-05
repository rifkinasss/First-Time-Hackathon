"use client";

import { useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Database, Search } from "lucide-react";
import { ActivityKey, UnitRecord } from "@/lib/frms-types";
import { StatusBadge } from "./status-badge";

const number = (value: number | null | undefined, digits = 0) => value === null || value === undefined ? "—" : value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });

export function UnitTable({ activity, units }: { activity: ActivityKey; units: UnitRecord[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units;
    const term = searchTerm.toLowerCase();
    return units.filter(
      (u) =>
        u.unitType.toLowerCase().includes(term) ||
        (u.category && u.category.toLowerCase().includes(term)) ||
        u.contractor.toLowerCase().includes(term)
    );
  }, [units, searchTerm]);

  const columns = useMemo<ColumnDef<UnitRecord>[]>(() => {
    const base: ColumnDef<UnitRecord>[] = [
      { accessorKey: "unitType", header: "Unit type", cell: ({ row }) => <div className="unit-name"><span className="unit-dot" /><div><strong>{row.original.unitType}</strong><small>{row.original.category ?? "Production equipment"}</small></div></div> },
      { accessorKey: "contractor", header: "Contractor", cell: ({ getValue }) => <span className="contractor-cell">{String(getValue())}</span> },
      { accessorKey: "qty", header: "Qty", cell: ({ getValue }) => <span className="mono-cell">{number(Number(getValue()))}</span> },
      { accessorKey: "fuelConsumption", header: "Fuel cons. / hr", cell: ({ getValue }) => <span className="mono-cell">{number(Number(getValue()))} <small>L</small></span> },
    ];
    if (activity === "loading" || activity === "hauling") {
      base.push({ accessorKey: "productivity", header: "Productivity", cell: ({ getValue }) => <span className="mono-cell">{number(Number(getValue()), 1)} <small>BCM/h</small></span> });
    } else {
      base.push({ accessorKey: "PA", header: "PA / UA", cell: ({ row }) => <span className="mono-cell">{number(row.original.PA ? row.original.PA * 100 : null, 0)}% <em>/</em> {number(row.original.UA ? row.original.UA * 100 : null, 0)}%</span> });
      base.push({ accessorKey: "EWH", header: "EWH / yr", cell: ({ getValue }) => <span className="mono-cell">{number(Number(getValue()), 0)} <small>h</small></span> });
    }
    base.push({ accessorKey: "fuelRatio", header: "Fuel ratio", cell: ({ getValue }) => <span className="fr-cell">{number(Number(getValue()), 4)} <small>L/BCM</small></span> });
    base.push({ accessorKey: "spoTarget", header: "SPO target", cell: ({ getValue }) => <span className="mono-cell muted-value">{number(Number(getValue()), 4)}</span> });
    base.push({ accessorKey: "variancePct", header: "Variance", cell: ({ getValue }) => <StatusBadge variance={Number(getValue())} compact /> });
    return base;
  }, [activity]);

  // TanStack Table intentionally exposes a mutable table instance; React Compiler should not memoize it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: filteredUnits, columns, getCoreRowModel: getCoreRowModel() });

  return <section className="table-panel panel">
    <div className="panel-heading table-heading">
      <div>
        <div className="section-kicker"><Database size={13} /> UNIT REGISTER</div>
        <h2>Equipment fuel performance <span>{filteredUnits.length} rows</span></h2>
      </div>
      <div className="table-tools">
        <div className="table-search" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--surface-0)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.35rem 0.75rem" }}>
          <Search size={14} style={{ opacity: 0.6 }} />
          <input
            type="text"
            placeholder="Search unit or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "0.75rem", outline: "none", width: "12rem" }}
          />
        </div>
      </div>
    </div>
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="empty-table">No units match the current scope or search filter.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <div className="table-footer">
      <span>Showing <strong>{filteredUnits.length}</strong> registered unit types</span>
      <span className="table-total"><span className="live-pulse" /> Live seed snapshot · updated 08:42</span>
    </div>
  </section>;
}
