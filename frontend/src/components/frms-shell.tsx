"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Building2, ChevronDown, ChevronRight, CircleHelp, FileText, Gauge, LayoutDashboard, Menu, X } from "lucide-react";
import { ACTIVITY_META, ActivityKey } from "@/lib/frms-types";

const activities: ActivityKey[] = ["loading", "hauling", "supporting", "dewatering"];

export function FrmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="frms-shell">
      <aside className={`frms-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark"><Gauge size={21} strokeWidth={2.4} /></div>
          <div>
            <div className="brand-name">FRMS<span> / OPS</span></div>
            <div className="brand-subtitle">Fuel ratio monitoring</div>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <div className="sidebar-site">
          <span className="site-dot" />
          <div><span className="eyebrow">ACTIVE SITE</span><strong>PT. X · Kaltim Operations</strong></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-label">Workspace</span>
          <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
            <Building2 size={17} /><span>Multi-Contractor</span><span className="nav-kicker">01</span>
          </Link>
          <Link href="/overview" className={`nav-item ${pathname === "/overview" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
            <LayoutDashboard size={17} /><span>Overview</span><span className="nav-kicker">02</span>
          </Link>
          <div className="nav-group-label"><span>Fuel ratio monitoring</span><ChevronDown size={14} /></div>
          {activities.map((activity, index) => {
            const href = `/fuel-ratio/${activity}`;
            const active = pathname === href;
            return <Link key={activity} href={href} className={`nav-item sub-item ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
              <span className={`activity-marker marker-${activity}`} />
              <span>{ACTIVITY_META[activity].label}</span><span className="nav-kicker">0{index + 3}</span>
            </Link>;
          })}

          <span className="nav-label nav-label-spaced">Analysis</span>
          <Link href="/overview" className="nav-item muted-nav"><BarChart3 size={17} /><span>Performance trends</span><ChevronRight size={14} className="push-right" /></Link>
          <Link href="/overview" className="nav-item muted-nav"><FileText size={17} /><span>Reports</span><span className="soon-chip">SOON</span></Link>
        </nav>

        <div className="sidebar-footer">
          <div className="footer-status"><span className="live-pulse" /> Data sync healthy <span className="footer-time">08:42:16</span></div>
          <div className="footer-user"><div className="user-avatar">OP</div><div><strong>Operations team</strong><span>Read-only workspace</span></div><CircleHelp size={15} className="muted-icon" /></div>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <main className="frms-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="topbar-context"><span className="topbar-kicker">OPERATIONS CONTROL</span><span className="topbar-separator">/</span><span>Fuel efficiency intelligence</span></div>
          <div className="topbar-right"><span className="last-sync"><span className="live-pulse" /> LIVE · 05 AUG 2026</span><div className="topbar-divider" /><button className="icon-button" aria-label="Help"><CircleHelp size={17} /></button><div className="topbar-avatar">OP</div></div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
