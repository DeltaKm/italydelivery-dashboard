"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertTriangle className="size-12 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold">Qualcosa è andato storto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "Errore imprevisto durante il caricamento della pagina."}
        </p>
      </div>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}
