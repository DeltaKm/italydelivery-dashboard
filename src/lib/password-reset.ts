import "server-only";
import { backendFetch } from "@/lib/backend";

// Flusso pubblico, nessun token di sessione: l'utente non è ancora loggato.
export async function requestPasswordReset(email: string) {
  return backendFetch<{ message: string }>("/v1/auth/request-reset", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return backendFetch<{ message: string }>(`/v1/auth/reset?token=${encodeURIComponent(token)}`, {
    method: "POST",
    body: { newPassword },
  });
}
