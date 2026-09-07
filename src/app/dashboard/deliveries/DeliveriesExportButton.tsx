"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import { exportDeliveriesAction } from "@/lib/actions";

const HEADERS = [
  "Ordine",
  "Attività",
  "Destinatario",
  "Indirizzo",
  "Programmata",
  "Stato",
  "Raider",
  "Compenso (€)",
  "Totale pagato (€)",
];

export default function DeliveriesExportButton() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    const result = await exportDeliveriesAction({
      status: searchParams.get("status") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      businessId: searchParams.get("businessId") ?? undefined,
      raiderId: searchParams.get("raiderId") ?? undefined,
    });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    downloadCsv("consegne.csv", HEADERS, result.rows);
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={download} disabled={loading}>
      <Download className="size-3.5" />
      {loading ? "Esportazione..." : "Esporta CSV"}
    </Button>
  );
}
