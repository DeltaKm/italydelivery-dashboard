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
  // Solo LOGISTICS (obbligatorio, tra i business che gestisce)
  businessIds?: string[];
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

// Solo LOGISTICS: sincronizza le attività (tra quelle gestite) a cui è collegato
// un raider. Non è un replace totale: tocca solo le relazioni verso i business
// di questa logistica, senza toccare eventuali collegamenti ad altre attività.
export async function syncRaiderManagedBusinesses(
  token: string,
  raiderId: string,
  businessIds: string[]
) {
  return backendFetch(`/v2/logistics/raiders/${raiderId}/businesses`, {
    method: "PATCH",
    token,
    body: { businessIds },
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

// Segna come pagate le consegne completate e non ancora pagate di un raider,
// nello stesso scope (data/attività/logistica) attualmente visualizzato.
export async function markRaiderPaid(
  token: string,
  role: Role,
  id: string,
  params: { dateFrom?: string; dateTo?: string; businessId?: string; logisticsId?: string }
) {
  return backendFetch<{ message: string; count: number }>(
    `${raidersPathForRole(role)}/${id}/mark-paid`,
    { method: "PUT", token, body: params }
  );
}

// Annulla il pagamento delle consegne segnate come pagate di un raider,
// nello stesso scope (data/attività/logistica) attualmente visualizzato.
export async function unmarkRaiderPaid(
  token: string,
  role: Role,
  id: string,
  params: { dateFrom?: string; dateTo?: string; businessId?: string; logisticsId?: string }
) {
  return backendFetch<{ message: string; count: number }>(
    `${raidersPathForRole(role)}/${id}/unmark-paid`,
    { method: "PUT", token, body: params }
  );
}
