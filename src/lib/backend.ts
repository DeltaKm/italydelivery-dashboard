import "server-only";
import { redirect } from "next/navigation";

const BACKEND_API_URL = process.env.BACKEND_API_URL!;
const BACKEND_API_KEY = process.env.BACKEND_API_KEY!;

if (!BACKEND_API_URL || !BACKEND_API_KEY) {
  throw new Error("BACKEND_API_URL / BACKEND_API_KEY non definite in .env.local");
}

export class BackendError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `Backend error ${status}`
    );
    this.status = status;
    this.body = body;
  }
}

type BackendFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
};

export async function backendFetch<T = unknown>(
  path: string,
  options: BackendFetchOptions = {}
): Promise<T> {
  const url = new URL(`${BACKEND_API_URL}${path}`);

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    "x-api-key": BACKEND_API_KEY,
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // 401 = JWT mancante/scaduto lato backend: la sessione non è più valida,
    // meglio rimandare al login piuttosto che far esplodere la pagina.
    if (res.status === 401) {
      redirect("/login");
    }
    throw new BackendError(res.status, data);
  }

  return data as T;
}
