import "server-only";
import { backendFetch } from "@/lib/backend";
import type { BusinessProfile, LogisticsProfile } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

export function canManageOwnProfile(role: Role): boolean {
  return role === "BUSINESS" || role === "LOGISTICS";
}

export async function getBusinessProfile(token: string): Promise<BusinessProfile> {
  return backendFetch<BusinessProfile>("/v2/business/profile", { token });
}

export async function updateBusinessProfile(
  token: string,
  input: { bussinesName?: string; address?: string; businessCord?: string }
) {
  return backendFetch("/v2/business/profile", { method: "PATCH", token, body: input });
}

export async function getLogisticsProfile(token: string): Promise<LogisticsProfile> {
  const data = await backendFetch<{ logistics: LogisticsProfile }>("/v2/logistics/profile", {
    token,
  });
  return data.logistics;
}

export async function updateLogisticsProfile(
  token: string,
  input: { name?: string; surname?: string }
) {
  return backendFetch("/v2/logistics/profile", { method: "PATCH", token, body: input });
}
