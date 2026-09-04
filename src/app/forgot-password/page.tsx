"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { brand } from "@/theme/italydelivery";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Errore imprevisto");
        return;
      }
      setSent(true);
    } catch {
      setError("Impossibile contattare il server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: brand.background }}
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl" style={{ color: brand.primary }}>
            Password dimenticata
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Alert>
              <AlertTitle>Controlla la tua casella email</AlertTitle>
              <AlertDescription>
                Se l&apos;indirizzo è registrato, riceverai a breve un&apos;email con le
                istruzioni per reimpostare la password.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Inserisci l&apos;email del tuo account: ti invieremo un link per reimpostare la
                password.
              </p>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required disabled={loading} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Invio..." : "Invia link di reset"}
                </Button>
              </form>
            </>
          )}

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Torna al login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
