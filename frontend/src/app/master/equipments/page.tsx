import type { Metadata } from "next";
import { MasterEquipmentClient } from "@/components/pages/MasterEquipmentClient";

export const metadata: Metadata = { title: "Master Equipment", description: "Kelola master data equipment." };

export default function MasterEquipmentsPage() { return <MasterEquipmentClient />; }
