import "server-only";
import { backendFetch } from "@/lib/backend";
import type { BusinessesResponse, BusinessDetail } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

function businessesPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/v2/admin/businesses";
    case "LOGISTICS":
      return "/v2/logistics/businesses";
    default:
      throw new Error(`Ruolo senza accesso alle attività: ${role}`);
  }
}

export function canManageBusinesses(role: Role): boolean {
  return role === "ADMIN" || role === "LOGISTICS";
}

export async function listBusinesses(
  token: string,
  role: Role,
  params: { limit?: number; offset?: number; search?: string } = {}
): Promise<BusinessesResponse> {
  return backendFetch<BusinessesResponse>(businessesPathForRole(role), {
    token,
    searchParams: {
      limit: params.limit ?? 200,
      offset: params.offset ?? 0,
      search: params.search,
    },
  });
}

export type CreateBusinessInput = {
  email: string;
  password: string;
  bussinesName: string;
  address: string;
  businessCord?: string;
  imgUrl?: string;
};

export async function createBusiness(token: string, role: Role, input: CreateBusinessInput) {
  return backendFetch<{ message: string; business: { id: string; name: string } }>(
    businessesPathForRole(role),
    { method: "POST", token, body: input }
  );
}

export type UpdateBusinessInput = {
  bussinesName?: string;
  address?: string;
  businessCord?: string;
  imgUrl?: string;
};

export async function updateBusiness(
  token: string,
  role: Role,
  id: string,
  input: UpdateBusinessInput
) {
  return backendFetch(`${businessesPathForRole(role)}/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

// Solo ADMIN: disabilita l'account (soft-delete lato backend)
export async function disableBusiness(token: string, id: string) {
  return backendFetch(`/v2/admin/businesses/${id}`, { method: "DELETE", token });
}

// Solo LOGISTICS: attiva/disattiva un'attività che gestisce
export async function setBusinessStatus(token: string, id: string, expired: boolean) {
  return backendFetch(`/v2/logistics/businesses/${id}/status`, {
    method: "PUT",
    token,
    body: { expired },
  });
}

// Solo ADMIN: sincronizza logistiche/raider collegati a un business (sostituisce l'insieme corrente)
export async function syncBusinessLogistics(token: string, businessId: string, logisticsIds: string[]) {
  return backendFetch(`/v2/admin/businesses/${businessId}/logistics`, {
    method: "PATCH",
    token,
    body: { logisticsIds },
  });
}

export async function syncBusinessRaiders(token: string, businessId: string, raiderIds: string[]) {
  return backendFetch(`/v2/admin/businesses/${businessId}/raiders`, {
    method: "PATCH",
    token,
    body: { raiderIds },
  });
}

export async function getBusiness(token: string, role: Role, id: string): Promise<BusinessDetail> {
  const data = await backendFetch<{ business: BusinessDetail }>(
    `${businessesPathForRole(role)}/${id}`,
    { token }
  );
  return data.business;
}
