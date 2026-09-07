"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { brand } from "@/theme/italydelivery";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (newPassword.length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Errore imprevisto");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
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
        <CardHeader className="justify-items-center text-center">
          <Image src="/logo192.png" alt="ItalyDelivery" width={64} height={64} className="mb-1 rounded-xl" />
          <CardTitle className="text-xl text-foreground">Reimposta password</CardTitle>
        </CardHeader>
        <CardContent>
          {!token ? (
            <Alert variant="destructive">
              <AlertTitle>Link non valido</AlertTitle>
              <AlertDescription>
                Manca il token di reset. Richiedi un nuovo link dalla pagina di recupero
                password.
              </AlertDescription>
            </Alert>
          ) : done ? (
            <Alert>
              <AlertTitle>Password aggiornata</AlertTitle>
              <AlertDescription>Ti stiamo reindirizzando al login…</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">Nuova password</Label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Conferma password</Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvataggio..." : "Imposta nuova password"}
              </Button>
            </form>
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
