import "server-only";
import { backendFetch } from "@/lib/backend";
import type { AdminStats, LogisticsStats, BusinessStats } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

function statsPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/v2/admin/stats";
    case "LOGISTICS":
      return "/v2/logistics/stats/global";
    case "BUSINESS":
      return "/v2/business/stats";
    default:
      throw new Error(`Ruolo senza statistiche: ${role}`);
  }
}

export async function getStats(
  token: string,
  role: Role,
  params: { dateFrom?: string; dateTo?: string; businessId?: string; raiderId?: string } = {}
): Promise<AdminStats | LogisticsStats | BusinessStats> {
  return backendFetch(statsPathForRole(role), {
    token,
    searchParams: {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      businessId: params.businessId,
      raiderId: params.raiderId,
    },
  });
}
