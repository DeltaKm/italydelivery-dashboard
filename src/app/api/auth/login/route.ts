import { NextRequest, NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";
import { setSession, type Role } from "@/lib/session";

type LoginResponse = {
  token: string;
  user: { id: string; email: string; role: Role };
};

// Ruoli che possono accedere a questo pannello gestionale.
// I RAIDER usano solo l'app mobile, non hanno accesso qui.
const ALLOWED_ROLES: Role[] = ["ADMIN", "LOGISTICS", "BUSINESS"];

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email e password sono obbligatorie" },
      { status: 400 }
    );
  }

  try {
    const data = await backendFetch<LoginResponse>("/v2/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (!ALLOWED_ROLES.includes(data.user.role)) {
      return NextResponse.json(
        { message: "Questo account non ha accesso al pannello gestionale" },
        { status: 403 }
      );
    }

    await setSession(data.token, data.user.role);

    return NextResponse.json({ role: data.user.role });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Errore interno" }, { status: 500 });
  }
}
