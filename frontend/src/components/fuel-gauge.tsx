import { ActivitySummary } from "@/lib/frms-types";

export function FuelGauge({ summary, large = false }: { summary: ActivitySummary; large?: boolean }) {
  const progress = Math.min(summary.actualFR / (summary.spoFR * 1.28), 1);
  const good = summary.variancePct <= 0;
  return <div className={`fuel-gauge ${large ? "large" : ""}`}>
    <svg viewBox="0 0 200 122" role="img" aria-label={`${summary.actualFR.toFixed(4)} liters per BCM against ${summary.spoFR.toFixed(4)} SPO target`}>
      <path d="M 20 100 A 80 80 0 0 1 180 100" pathLength="100" className="gauge-track" />
      <path d="M 20 100 A 80 80 0 0 1 180 100" pathLength="100" className={`gauge-progress ${good ? "gauge-good" : ""}`} strokeDasharray={`${progress * 100} 100`} />
      <line x1="100" y1="100" x2={100 + Math.cos(Math.PI - Math.PI * progress) * 62} y2={100 - Math.sin(Math.PI * progress) * 62} className="gauge-needle" />
      <circle cx="100" cy="100" r="5" className="gauge-center" />
      <text x="100" y="76" textAnchor="middle" className="gauge-number">{summary.actualFR.toFixed(4)}</text>
      <text x="100" y="91" textAnchor="middle" className="gauge-unit">L / BCM</text>
      <text x="18" y="119" className="gauge-scale">0</text><text x="182" y="119" textAnchor="end" className="gauge-scale">{(summary.spoFR * 1.28).toFixed(2)}</text>
    </svg>
    <div className="gauge-footer"><span>Target SPO <strong>{summary.spoFR.toFixed(4)}</strong></span><span className={good ? "text-teal" : "text-amber"}>{good ? "Within target" : `${summary.variancePct.toFixed(1)}% over`}</span></div>
  </div>;
}
