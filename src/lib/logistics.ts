import "server-only";
import { backendFetch } from "@/lib/backend";
import type { LogisticsResponse, LogisticsDetail } from "@/lib/types";

// Sezione riservata all'ADMIN: gli account Logistics possono auto-registrarsi
// (v2/auth/register-logistics) oppure essere creati direttamente dall'admin
// (vedi createLogistics sotto); da qui l'admin li vede tutti e assegna i business.
export async function listLogisticsAccounts(
  token: string,
  params: { limit?: number; offset?: number } = {}
): Promise<LogisticsResponse> {
  return backendFetch<LogisticsResponse>("/v2/admin/logistics", {
    token,
    searchParams: { limit: params.limit ?? 200, offset: params.offset ?? 0 },
  });
}

export type CreateLogisticsInput = {
  email: string;
  password: string;
  name: string;
  surname: string;
  imgUrl?: string;
};

export async function createLogistics(token: string, input: CreateLogisticsInput) {
  return backendFetch<{ message: string; logistics: { id: string } }>("/v2/admin/logistics", {
    method: "POST",
    token,
    body: input,
  });
}

export async function syncLogisticsBusinesses(
  token: string,
  logisticsId: string,
  businessIds: string[]
) {
  return backendFetch("/v2/admin/logistics/assign-business", {
    method: "PATCH",
    token,
    body: { logisticsId, businessIds },
  });
}

export async function updateLogistics(
  token: string,
  id: string,
  input: { name?: string; surname?: string; imgUrl?: string }
) {
  return backendFetch(`/v2/admin/logistics/${id}`, { method: "PATCH", token, body: input });
}

export async function disableLogistics(token: string, id: string) {
  return backendFetch(`/v2/admin/logistics/${id}`, { method: "DELETE", token });
}

export async function getLogistics(token: string, id: string): Promise<LogisticsDetail> {
  const data = await backendFetch<{ logistics: LogisticsDetail }>(`/v2/admin/logistics/${id}`, {
    token,
  });
  return data.logistics;
}
