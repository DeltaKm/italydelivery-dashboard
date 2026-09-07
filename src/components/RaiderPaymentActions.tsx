"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CircleDollarSign, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { markRaiderPaidAction, unmarkRaiderPaidAction } from "@/lib/actions";

export default function RaiderPaymentActions({
  raiderId,
  raiderName,
  amount,
  paidAmount,
}: {
  raiderId: string;
  raiderName: string;
  amount: string;
  paidAmount: string;
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [markOpen, setMarkOpen] = useState(false);
  const [unmarkOpen, setUnmarkOpen] = useState(false);

  const nothingToPay = Number(amount) <= 0;
  const nothingToUnmark = Number(paidAmount) <= 0;

  function scopeParams() {
    return {
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      businessId: searchParams.get("businessId") ?? undefined,
      logisticsId: searchParams.get("logisticsId") ?? undefined,
    };
  }

  async function confirmMark() {
    setLoading(true);
    const result = await markRaiderPaidAction(raiderId, scopeParams());
    setLoading(false);
    if (result.ok) {
      toast.success("Pagamento registrato");
      setMarkOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  async function confirmUnmark() {
    setLoading(true);
    const result = await unmarkRaiderPaidAction(raiderId, scopeParams());
    setLoading(false);
    if (result.ok) {
      toast.success("Pagamento annullato");
      setUnmarkOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <AlertDialog open={markOpen} onOpenChange={setMarkOpen}>
        <AlertDialogTrigger
          render={
            <Button variant="outline" size="sm" className="gap-1.5" disabled={nothingToPay || loading} />
          }
        >
          <CircleDollarSign className="size-3.5" />
          Segna come pagato
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Segnare {raiderName} come pagato?</AlertDialogTitle>
            <AlertDialogDescription>
              Segna come pagate tutte le consegne completate e non ancora pagate di questo raider,
              nel periodo/filtro attualmente selezionato (€ {amount}). L&apos;importo &quot;Da
              pagare&quot; scenderà di conseguenza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMark}>Conferma</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unmarkOpen} onOpenChange={setUnmarkOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              disabled={nothingToUnmark || loading}
              title="Annulla pagamento"
            />
          }
        >
          <RotateCcw className="size-3.5" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annullare il pagamento di {raiderName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Riporta a &quot;da pagare&quot; tutte le consegne già segnate come pagate di questo
              raider, nel periodo/filtro attualmente selezionato (€ {paidAmount}). Usalo solo se il
              pagamento è stato segnato per errore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnmark}>Conferma</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
