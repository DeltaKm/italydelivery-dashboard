import "server-only";
import { backendFetch } from "@/lib/backend";
import type { Delivery, DeliveriesResponse } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

// I tre ruoli vedono lo stesso tipo di dato, ma lo scoping (tutto / business
// assegnati / solo il proprio business) è enforced dal backend in base al ruolo
// del token — qui scegliamo solo il path giusto.
function deliveriesPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/v2/admin/deliveries";
    case "LOGISTICS":
      return "/v2/logistics/deliveries";
    case "BUSINESS":
      return "/v2/business/deliveries";
    default:
      throw new Error(`Ruolo senza accesso alle deliveries: ${role}`);
  }
}

export async function listDeliveries(
  token: string,
  role: Role,
  params: {
    limit?: number;
    offset?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    businessId?: string;
    raiderId?: string;
  } = {}
): Promise<DeliveriesResponse> {
  return backendFetch<DeliveriesResponse>(deliveriesPathForRole(role), {
    token,
    searchParams: {
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      status: params.status,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      businessId: params.businessId,
      raiderId: params.raiderId,
    },
  });
}

export async function getDelivery(token: string, role: Role, id: string): Promise<Delivery> {
  const data = await backendFetch<{ delivery: Delivery }>(`${deliveriesPathForRole(role)}/${id}`, {
    token,
  });
  return data.delivery;
}

export type CreateDeliveryInput = {
  businessId?: string; // richiesto per LOGISTICS e ADMIN, implicito per BUSINESS
  orderId?: string;
  schedulingDelivery: string;
  customerName: string;
  customerSurname: string;
  deliveryAddress: string;
  paymentType: string;
  totalPaid: number;
  totalShipping: number;
  mobile?: string;
  phone?: string;
  note?: string;
  deliveryType?: string;
  assignToRaiderId?: string;
};

export async function createDelivery(
  token: string,
  role: Role,
  input: CreateDeliveryInput
): Promise<Delivery> {
  if (role !== "LOGISTICS" && role !== "BUSINESS" && role !== "ADMIN") {
    throw new Error("Solo Admin, Logistics e Business possono creare consegne");
  }
  const data = await backendFetch<{ delivery: Delivery }>(deliveriesPathForRole(role), {
    method: "POST",
    token,
    body: input,
  });
  return data.delivery;
}

export async function reassignDelivery(
  token: string,
  role: Role,
  deliveryId: string,
  newRaiderId: string
): Promise<void> {
  await backendFetch(`${deliveriesPathForRole(role)}/${deliveryId}/reassign`, {
    method: "POST",
    token,
    body: { newRaiderId },
  });
}

export type UpdateDeliveryInput = {
  schedulingDelivery?: string;
  note?: string;
  compensation?: number;
  totalPaid?: number;
  mobile?: string;
  phone?: string;
  deliveryAddress?: string;
  // Solo ADMIN e LOGISTICS possono cambiare lo stato manualmente.
  status?: string;
};

export async function updateDelivery(
  token: string,
  role: Role,
  id: string,
  input: UpdateDeliveryInput
) {
  return backendFetch(`${deliveriesPathForRole(role)}/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

// ADMIN: elimina definitivamente (irreversibile).
// LOGISTICS: soft-delete (status DELETED), su business assegnati.
// BUSINESS: soft-delete, solo se non ancora assegnata a un raider.
export async function deleteDelivery(token: string, role: Role, id: string) {
  return backendFetch(`${deliveriesPathForRole(role)}/${id}`, { method: "DELETE", token });
}
