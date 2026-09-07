"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CircleDollarSign } from "lucide-react";
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
import { markRaiderPaidAction } from "@/lib/actions";

export default function MarkPaidButton({
  raiderId,
  raiderName,
  amount,
}: {
  raiderId: string;
  raiderName: string;
  amount: string;
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const nothingToPay = Number(amount) <= 0;

  async function confirm() {
    setLoading(true);
    const result = await markRaiderPaidAction(raiderId, {
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      businessId: searchParams.get("businessId") ?? undefined,
      logisticsId: searchParams.get("logisticsId") ?? undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Pagamento registrato");
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
          <AlertDialogAction onClick={confirm}>Conferma</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
