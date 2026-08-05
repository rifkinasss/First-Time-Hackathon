import type { Metadata } from "next";
import "./globals.css";
import { FrmsShell } from "@/components/frms-shell";

export const metadata: Metadata = {
  title: "FRMS / Operations Control",
  description: "Activity-based fuel ratio monitoring for mining operations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><FrmsShell>{children}</FrmsShell></body></html>;
}
