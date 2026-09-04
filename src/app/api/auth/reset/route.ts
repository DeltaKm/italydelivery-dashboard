import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/lib/password-reset";
import { BackendError } from "@/lib/backend";

export async function POST(request: NextRequest) {
  const { token, newPassword } = await request.json();
  if (!token || !newPassword) {
    return NextResponse.json({ message: "Dati mancanti" }, { status: 400 });
  }

  try {
    await resetPassword(token, newPassword);
    return NextResponse.json({ message: "Password aggiornata con successo" });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Errore imprevisto, riprova." }, { status: 500 });
  }
}
