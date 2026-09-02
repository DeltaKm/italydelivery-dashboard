import "server-only";
import { backendFetch } from "@/lib/backend";
import type { RaidersResponse, RaiderDetail, Vehicle } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

function raidersPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/v2/admin/raiders";
    case "LOGISTICS":
      return "/v2/logistics/raiders";
    case "BUSINESS":
      return "/v2/business/raiders";
    default:
      throw new Error(`Ruolo senza accesso ai raider: ${role}`);
  }
}

export async function listRaiders(
  token: string,
  role: Role,
  params: { status?: "confirmed" | "pending" | "all" } = {}
): Promise<RaidersResponse> {
  return backendFetch<RaidersResponse>(raidersPathForRole(role), {
    token,
    // "status" è un filtro valido solo per la vista Business (richieste pending);
    // admin/logistics lo ignorano semplicemente lato backend.
    searchParams: { limit: 200, offset: 0, status: params.status },
  });
}

export type CreateRaiderInput = {
  email: string;
  password: string;
  name: string;
  surname: string;
  vehicle: Vehicle;
  mobile?: string;
  // Solo ADMIN (opzionale)
  assignToBusinessIds?: string[];
  // Solo LOGISTICS (obbligatorio)
  businessId?: string;
  imgUrl?: string;
};

export async function createRaider(token: string, role: Role, input: CreateRaiderInput) {
  return backendFetch<{ message: string; raider: { id: string } }>(raidersPathForRole(role), {
    method: "POST",
    token,
    body: input,
  });
}

export async function approveRaiders(token: string, raiderIds: string[]) {
  return backendFetch<{ message: string }>("/v2/business/raiders/approve", {
    method: "POST",
    token,
    body: { raiderIds },
  });
}

export type UpdateRaiderInput = {
  name?: string;
  surname?: string;
  vehicle?: Vehicle;
  mobile?: string;
  email?: string; // solo ADMIN
  imgUrl?: string; // solo ADMIN
};

export async function updateRaider(
  token: string,
  role: Role,
  id: string,
  input: UpdateRaiderInput
) {
  return backendFetch(`${raidersPathForRole(role)}/${id}`, { method: "PATCH", token, body: input });
}

// ADMIN: elimina definitivamente raider + utente (irreversibile).
// LOGISTICS/BUSINESS: rimuove solo il collegamento con l'attività.
export async function removeRaider(token: string, role: Role, id: string) {
  return backendFetch(`${raidersPathForRole(role)}/${id}`, { method: "DELETE", token });
}

// Solo ADMIN: sincronizza le attività assegnate a un raider (sostituisce l'insieme corrente)
export async function syncRaiderBusinesses(token: string, raiderId: string, businessIds: string[]) {
  return backendFetch("/v2/admin/raiders/assign", {
    method: "PATCH",
    token,
    body: { raiderId, businessIds },
  });
}

// ADMIN: qualsiasi raider. LOGISTICS: raider collegati alle attività gestite.
// BUSINESS: raider collegati alla propria attività.
export async function setRaiderActive(token: string, role: Role, id: string, isActive: boolean) {
  return backendFetch(`${raidersPathForRole(role)}/${id}/status`, {
    method: "PUT",
    token,
    body: { isActive },
  });
}

// Il dettaglio completo (storico consegne, business collegati) è disponibile
// solo per l'ADMIN: gli endpoint logistics/business restituiscono un
// sottoinsieme più povero, non coperto da questa vista.
export async function getRaider(token: string, id: string): Promise<RaiderDetail> {
  const data = await backendFetch<{ raider: RaiderDetail }>(`/v2/admin/raiders/${id}`, { token });
  return data.raider;
}
