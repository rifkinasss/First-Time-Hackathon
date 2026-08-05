"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside SidebarProvider");
  return context;
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen, collapsed, toggleCollapsed: () => setCollapsed((value) => !value) }}>
      <div data-slot="sidebar-provider" className="flex min-h-screen w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({ children, className }: React.HTMLAttributes<HTMLElement>) {
  const { mobileOpen, setMobileOpen, collapsed } = useSidebar();
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        data-slot="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(86vw,18rem)] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-xl transition-[width,transform] duration-200 lg:w-72 lg:translate-x-0 lg:shadow-none",
          collapsed && "lg:w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <X className="size-4" />
        </button>
        {children}
      </aside>
    </>
  );
}

function SidebarTrigger({ className }: { className?: string }) {
  const { mobileOpen, setMobileOpen, toggleCollapsed } = useSidebar();
  return (
    <button
      type="button"
      aria-label={mobileOpen ? "Tutup navigasi" : "Buka navigasi"}
      title={mobileOpen ? "Tutup navigasi" : "Buka navigasi"}
      onClick={() => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
          setMobileOpen(!mobileOpen);
        } else {
          toggleCollapsed();
        }
      }}
      className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700", className)}
    >
      <Menu className="size-5" />
    </button>
  );
}

function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar();
  return <div data-slot="sidebar-inset" className={cn("min-h-screen flex-1 transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-72", className)} {...props} />;
}

function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-header" className={cn("p-4", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-content" className={cn("min-h-0 flex-1 overflow-y-auto px-3 py-4", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-footer" className={cn("p-3", className)} {...props} />;
}

function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section data-slot="sidebar-group" className={cn("mb-6", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sidebar-group-label" className={cn("px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul data-slot="sidebar-menu" className={cn("flex flex-col gap-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li data-slot="sidebar-menu-item" className={cn("group/menu-item relative", className)} {...props} />;
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
