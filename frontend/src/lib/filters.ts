import { create } from "zustand";
import { DEFAULT_FILTERS, Filters } from "./frms-types";

type FilterStore = Filters & {
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTERS,
  setFilters: (filters) => set(filters),
  resetFilters: () => set(DEFAULT_FILTERS),
}));
