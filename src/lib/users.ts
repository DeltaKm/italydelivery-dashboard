import "server-only";
import { backendFetch } from "@/lib/backend";
import type { UsersResponse, UserAccount } from "@/lib/types";

// Sezione riservata all'ADMIN.
export async function listUsers(
  token: string,
  params: { role?: string; limit?: number; offset?: number } = {}
): Promise<UsersResponse> {
  return backendFetch<UsersResponse>("/v2/admin/users", {
    token,
    searchParams: { role: params.role, limit: params.limit ?? 200, offset: params.offset ?? 0 },
  });
}

export async function setUserStatus(token: string, userId: string, expired: boolean) {
  return backendFetch(`/v2/admin/users/${userId}/status`, {
    method: "PUT",
    token,
    body: { expired },
  });
}

// ATTENZIONE: cambia solo l'enum User.role, non crea/rimuove il profilo
// Business/Logistics/Raider collegato — un utente con ruolo disallineato dal
// proprio profilo perderà l'accesso alle funzioni di quel ruolo.
export async function setUserRole(token: string, userId: string, role: UserAccount["role"]) {
  return backendFetch(`/v2/admin/users/${userId}/role`, { method: "PUT", token, body: { role } });
}
