"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";

interface DashboardShellProps {
  activeFeature: number;
  setActiveFeature?: (featureId: number) => void;
  children: ReactNode;
}

export function DashboardShell({ activeFeature, setActiveFeature, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature ?? (() => undefined)} />
      <SidebarInset>
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-amber-200 selection:text-slate-900">
          <Toaster />
          <AppHeader activeFeature={activeFeature} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </main>
          <footer className="w-full border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500 sm:px-6">
            Fuel Ratio Monitoring System (FRMS) Multi-Contractor Edition &copy; 2026 — Mine Energy &amp; Performance Analytics
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
