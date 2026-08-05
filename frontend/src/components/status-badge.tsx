import { AlertTriangle, ArrowDownRight, ArrowUpRight, Check } from "lucide-react";

export function StatusBadge({ variance, compact = false }: { variance: number; compact?: boolean }) {
  const good = variance <= 0;
  const warning = variance > 0 && variance <= 10;
  const Icon = good ? Check : warning ? AlertTriangle : ArrowUpRight;
  const label = good ? "Within SPO" : warning ? "Watch" : "Over SPO";
  return <span className={`status-badge ${good ? "good" : warning ? "warning" : "danger"} ${compact ? "compact" : ""}`}>
    <Icon size={compact ? 11 : 12} /> {compact ? `${variance > 0 ? "+" : ""}${variance.toFixed(1)}%` : `${label} · ${variance > 0 ? "+" : ""}${variance.toFixed(1)}%`}
  </span>;
}

export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const good = value <= 0;
  return <span className={`delta ${good ? "delta-good" : "delta-bad"}`}>
    {good ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />} {value > 0 ? "+" : ""}{value.toFixed(1)}{suffix}
  </span>;
}
