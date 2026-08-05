import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { OperationalInputClient } from "./OperationalInputClient";

const api = vi.hoisted(() => ({
  calculateDewatering: vi.fn(),
  calculateDewateringAll: vi.fn(),
  calculateHauling: vi.fn(),
  calculateLoading: vi.fn(),
  calculateSupporting: vi.fn(),
  calculateSupportingAll: vi.fn(),
  fetchContractors: vi.fn(),
  fetchEquipment: vi.fn(),
  fetchFuelReferences: vi.fn(),
  fetchHaulingDistanceReferences: vi.fn(),
}));

vi.mock("@/lib/api", () => api);
vi.mock("@/components/layout/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/toast", () => ({ toast: { add: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OperationalInputClient", () => {
  it("mengirim ID equipment dan fuel reference pada submit Loading", async () => {
    api.fetchContractors.mockResolvedValue([{ id: 7, code: "PTA", company_name: "PT A", status: "active", created_at: "", updated_at: "" }]);
    api.fetchEquipment.mockResolvedValue([{ id: 42, contractor_id: 7, unit_type: "EX26007", item: "Excavator", activity: "loading", qty: 1, productivity: 100, created_at: "", updated_at: "" }]);
    api.fetchFuelReferences.mockResolvedValue([{ id: 13, merk: "Komatsu", type: "EX26007", activity: "loading", average: 100, low: 80, mid: 100, high: 120, created_at: "", updated_at: "" }]);
    api.fetchHaulingDistanceReferences.mockResolvedValue([]);
    api.calculateLoading.mockResolvedValue({ id: 99, equipment_id: 42, fuel_reference_id: 13, created_at: "", summary: { fuel_ratio: 0.2, fuel_cons: 100, productivity: 500 } });

    render(<OperationalInputClient />);

    await waitFor(() =>
      expect(
        (screen.getByRole("button", {
          name: /hitung & simpan fuel ratio/i,
        }) as HTMLButtonElement).disabled,
      ).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: /hitung & simpan fuel ratio/i }));

    await waitFor(() => expect(api.calculateLoading).toHaveBeenCalledWith({ equipment_id: 42, fuel_reference_id: 13 }));
    expect(await screen.findByText(/kalkulasi berhasil disimpan/i)).toBeTruthy();
  });
});
