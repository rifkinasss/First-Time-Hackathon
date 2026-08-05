import type { Metadata } from "next";
import { MasterFuelReferencesClient } from "@/components/pages/MasterFuelReferencesClient";

export const metadata: Metadata = { title: "Master Fuel Reference", description: "Acuan konsumsi fuel OEM." };

export default function MasterFuelReferencesPage() { return <MasterFuelReferencesClient />; }
