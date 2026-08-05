import type { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, unit, icon: Icon, accent = "amber", note, children }: {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  accent?: "amber" | "teal" | "blue" | "red" | "orange";
  note?: string;
  children?: React.ReactNode;
}) {
  return <div className={`metric-card accent-${accent}`}>
    <div className="metric-top"><span className="metric-label">{label}</span><span className="metric-icon"><Icon size={17} /></span></div>
    <div className="metric-value">{value}{unit && <small>{unit}</small>}</div>
    {note && <div className="metric-note">{note}</div>}
    {children}
  </div>;
}
