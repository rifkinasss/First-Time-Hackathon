"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes as BoxesIcon,
  Building2,
  Calculator,
  Database,
  Fuel,
  LayoutDashboard,
  ShieldAlert,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeFeature: number;
  setActiveFeature: (featureId: number) => void;
}

const primaryNavigation = [
  { id: 1, title: "Rasio Bahan Bakar Multi-Kontraktor", subtitle: "Kinerja kontraktor dan skor risiko", icon: Building2, tag: "01" },
  { id: 2, title: "Konsumsi Bahan Bakar per Aktivitas", subtitle: "Volume, BCM, dan jam operasi", icon: Activity, tag: "02" },
  { id: 3, title: "SPO dan Target Produksi", subtitle: "Parameter operasi dan keselarasan", icon: Target, tag: "03" },
];

export function AppSidebar({ activeFeature, setActiveFeature }: AppSidebarProps) {
  const { setMobileOpen, collapsed } = useSidebar();
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("frms-theme");
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <Sidebar>
      <SidebarHeader className={`border-b border-slate-200 py-5 ${collapsed ? "px-3" : "px-5"}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <Fuel className="size-5" />
          </div>
          <div className={collapsed ? "hidden" : "min-w-0"}>
            <p className="truncate text-sm font-bold tracking-tight text-slate-950">Pemantauan Rasio Bahan Bakar</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">Analitik operasional</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : undefined}>Ringkasan</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link
                href="/"
                onClick={closeMobile}
                title={collapsed ? "Ringkasan" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/" && activeFeature === 0 ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                <LayoutDashboard className={`size-4.5 ${pathname === "/" && activeFeature === 0 ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Ringkasan</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : undefined}>Analisis Lanjutan</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/monitoring-detail" onClick={closeMobile} title={collapsed ? "Detail Pemantauan" : undefined} className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/monitoring-detail" ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <BarChart3 className={`size-4.5 ${pathname === "/monitoring-detail" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Detail Pemantauan</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/contractor-performance" onClick={closeMobile} title={collapsed ? "Kinerja Kontraktor" : undefined} className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/contractor-performance" ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <ShieldAlert className={`size-4.5 ${pathname === "/contractor-performance" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Kinerja Kontraktor</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : undefined}>Masukan Operasional</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/operational-input" onClick={closeMobile} title={collapsed ? "Input Rasio Bahan Bakar" : undefined} className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/operational-input" ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <Calculator className={`size-4.5 ${pathname === "/operational-input" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Input Rasio Bahan Bakar</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : undefined}>Fitur Utama</SidebarGroupLabel>
          <SidebarMenu>
            {primaryNavigation.map((item) => {
              const Icon = item.icon;
              const route = item.id === 1
                ? "/fuel-ratio-multi-contractor"
                : item.id === 2
                  ? "/fuel-consumption-activity"
                  : item.id === 3
                    ? "/spo-target-production"
                    : null;
              const active = route
                ? pathname === route
                : activeFeature === item.id;
              const content = (
                <>
                  <Icon className={`mt-0.5 size-4.5 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
                  <span className={`min-w-0 ${collapsed ? "hidden" : ""}`}>
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {item.title}
                      {active && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">Aktif</span>}
                    </span>
                    <span className={`mt-0.5 block text-[11px] ${active ? "text-blue-700/75" : "text-slate-400"}`}>{item.subtitle}</span>
                  </span>
                </>
              );
              return (
                <SidebarMenuItem key={item.id}>
                  {route ? (
                    <Link
                      href={route}
                      onClick={closeMobile}
                      title={collapsed ? `${item.tag} · ${item.title}` : undefined}
                      className={`flex w-full items-start gap-3 rounded-xl py-2.5 text-left transition ${collapsed ? "justify-center px-2" : "px-3"} ${active ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setActiveFeature(item.id); closeMobile(); }}
                      title={collapsed ? `${item.tag} · ${item.title}` : undefined}
                      className={`flex w-full items-start gap-3 rounded-xl py-2.5 text-left transition ${collapsed ? "justify-center px-2" : "px-3"} ${active ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                    >
                      {content}
                    </button>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : undefined}>Panduan</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/panduan-aturan" onClick={closeMobile} title={collapsed ? "Panduan Aturan Risiko" : undefined} className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/panduan-aturan" ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <BookOpen className={`size-4.5 ${pathname === "/panduan-aturan" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Panduan Aturan Risiko</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : undefined}>Manajemen Data</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/master/contractors" onClick={closeMobile} title={collapsed ? "Kontraktor" : undefined} className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/master/contractors" ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <Database className={`size-4.5 ${pathname === "/master/contractors" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Kontraktor</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/master/equipments" onClick={closeMobile} title={collapsed ? "Peralatan" : undefined} className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/master/equipments" ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <BoxesIcon className={`size-4.5 ${pathname === "/master/equipments" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Peralatan</span>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/master/fuel-references" onClick={closeMobile} title={collapsed ? "Referensi Bahan Bakar" : undefined} className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-semibold transition ${collapsed ? "justify-center px-2" : "px-3"} ${pathname === "/master/fuel-references" ? "bg-blue-50 text-blue-800 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                <Fuel className={`size-4.5 ${pathname === "/master/fuel-references" ? "text-blue-600" : "text-slate-400"}`} />
                <span className={collapsed ? "hidden" : undefined}>Referensi Bahan Bakar</span>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`space-y-3 border-t border-slate-200 ${collapsed ? "px-2" : ""}`}>

        <div className={`px-2 pb-1 text-[10px] font-medium text-slate-400 ${collapsed ? "hidden" : ""}`}>FRMS v1.0 · KIC 2026</div>
      </SidebarFooter>
    </Sidebar>
  );
}
