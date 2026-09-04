"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import DataPagination from "@/components/DataPagination";
import type { Delivery, DeliveryStatus, Pagination } from "@/lib/types";

const STATUS_COLOR: Record<DeliveryStatus, "default" | "success" | "processing" | "warning" | "error"> = {
  CREATED: "default",
  ASSIGNED: "processing",
  ONDELIVERY: "warning",
  COMPLETED: "success",
  NOTDELIVERED: "error",
  DELETED: "default",
  RELEASED: "warning",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DeliveriesTable({
  deliveries,
  pagination,
  page,
  pageSize,
}: {
  deliveries: Delivery[];
  pagination: Pagination;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/dashboard/deliveries?${params.toString()}`);
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ordine</TableHead>
            <TableHead>Attività</TableHead>
            <TableHead>Destinatario</TableHead>
            <TableHead>Indirizzo</TableHead>
            <TableHead>Programmata</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Raider</TableHead>
            <TableHead className="text-right">Compenso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                Nessuna consegna
              </TableCell>
            </TableRow>
          )}
          {deliveries.map((delivery) => (
            <TableRow
              key={delivery.id}
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/deliveries/${delivery.id}`)}
            >
              <TableCell>{delivery.orderId ?? "—"}</TableCell>
              <TableCell>{delivery.name}</TableCell>
              <TableCell>{delivery.recipient}</TableCell>
              <TableCell className="max-w-48 truncate">{delivery.deliveryAddress}</TableCell>
              <TableCell>{formatDateTime(delivery.schedulingDelivery)}</TableCell>
              <TableCell>
                <StatusBadge color={STATUS_COLOR[delivery.status] ?? "default"}>
                  {delivery.status}
                </StatusBadge>
              </TableCell>
              <TableCell>
                {delivery.assignedToRaider
                  ? `${delivery.assignedToRaider.name} ${delivery.assignedToRaider.surname}`
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                € {delivery.compensation?.toFixed(2) ?? "0.00"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DataPagination
        page={page}
        pageSize={pageSize}
        total={pagination.total}
        onPageChange={goToPage}
        label="consegne totali"
      />
    </div>
  );
}
