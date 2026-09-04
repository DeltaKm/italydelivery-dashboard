import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";
import { BackendError } from "@/lib/backend";

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ message: "Email obbligatoria" }, { status: 400 });
  }

  try {
    await requestPasswordReset(email);
  } catch (error) {
    // Non riveliamo se l'email esiste o meno: stesso messaggio di successo
    // in entrambi i casi, per non permettere di enumerare gli account.
    if (!(error instanceof BackendError && error.status === 404)) {
      return NextResponse.json({ message: "Errore imprevisto, riprova." }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: "Se l'indirizzo è registrato, riceverai a breve un'email con le istruzioni.",
  });
}
