import type { Metadata } from "next";
import { MasterContractorsClient } from "@/components/pages/MasterContractorsClient";

export const metadata: Metadata = { title: "Master Kontraktor", description: "Kelola master data kontraktor." };

export default function MasterContractorsPage() { return <MasterContractorsClient />; }
