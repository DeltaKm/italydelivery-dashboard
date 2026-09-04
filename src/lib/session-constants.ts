// Nessuna dipendenza da "server-only" / "next/headers" qui:
// questo file viene importato sia da lib/session.ts (Server Components,
// Route Handlers) sia da proxy.ts (runtime separato, no accesso a next/headers).

export type Role = "ADMIN" | "LOGISTICS" | "BUSINESS" | "USER" | "RAIDER";

export const SESSION_COOKIE = "id_token";
export const ROLE_COOKIE = "role";
