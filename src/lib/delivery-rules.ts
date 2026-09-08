// Regole pure, senza chiamate di rete: separate da lib/deliveries.ts (che importa
// "server-only") in modo da poter essere importate anche dai Client Component.
import type { Delivery } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

export function canCreateDelivery(role: Role): boolean {
  return role === "LOGISTICS" || role === "BUSINESS" || role === "ADMIN";
}

// L'ADMIN può modificare sempre; LOGISTICS può farlo sui business assegnati;
// il BUSINESS solo finché l'ordine non è assegnato a un raider (o è ancora CREATED).
export function canEditDelivery(role: Role, delivery: Delivery): boolean {
  if (role === "BUSINESS") return !delivery.isAssigned || delivery.status === "CREATED";
  return role === "ADMIN" || role === "LOGISTICS";
}

export function canChangeDeliveryStatus(role: Role): boolean {
  return role === "ADMIN" || role === "LOGISTICS";
}
