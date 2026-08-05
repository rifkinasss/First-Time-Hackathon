import { fetchData, requestData } from "./client";
import type { Contractor, ContractorCreateInput, ContractorUpdateInput, Equipment, EquipmentCreateInput, EquipmentUpdateInput, FuelReference, FuelReferenceCreateInput, FuelReferenceUpdateInput } from "@/types/api";

export const fetchContractors = () => fetchData<Contractor[]>("/contractors");
export const createContractor = (input: ContractorCreateInput) => requestData<Contractor>("/contractors", { method: "POST", body: JSON.stringify(input) });
export const updateContractor = (id: number, input: ContractorUpdateInput) => requestData<Contractor>(`/contractors/${id}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteContractor = (id: number) => requestData<{ contractor_id: number }>(`/contractors/${id}`, { method: "DELETE" });

export const fetchEquipment = () => fetchData<Equipment[]>("/equipments");
export const createEquipment = (input: EquipmentCreateInput) => requestData<Equipment>("/equipments", { method: "POST", body: JSON.stringify(input) });
export const updateEquipment = (id: number, input: EquipmentUpdateInput) => requestData<Equipment>(`/equipments/${id}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteEquipment = (id: number) => requestData<{ equipment_id: number }>(`/equipments/${id}`, { method: "DELETE" });

export const fetchFuelReferences = () => fetchData<FuelReference[]>("/fuel-references");
export const createFuelReference = (input: FuelReferenceCreateInput) => requestData<FuelReference>("/fuel-references", { method: "POST", body: JSON.stringify(input) });
export const updateFuelReference = (id: number, input: FuelReferenceUpdateInput) => requestData<FuelReference>(`/fuel-references/${id}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteFuelReference = (id: number) => requestData<{ ref_id: number }>(`/fuel-references/${id}`, { method: "DELETE" });
