import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, ROLE_COOKIE, type Role } from "@/lib/session-constants";

export type { Role };

export type Session = {
  token: string;
  role: Role;
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const role = store.get(ROLE_COOKIE)?.value as Role | undefined;

  if (!token || !role) return null;
  return { token, role };
}

export async function setSession(token: string, role: Role) {
  const store = await cookies();
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24, // 24h, allineato alla scadenza del JWT lato backend
  };
  store.set(SESSION_COOKIE, token, common);
  store.set(ROLE_COOKIE, role, common);
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ROLE_COOKIE);
}
