import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import type { RaiderDetail, Vehicle, DeliveryStatus } from "@/lib/types";

const VEHICLE_LABEL: Record<Vehicle, string> = {
  CAR: "Auto",
  BICYCLE: "Bicicletta",
  MOTORCYCLE: "Moto",
  VAN: "Furgone",
  REFRIGERATEDVAN: "Furgone refrigerato",
  WITHOUTVEHICLE: "A piedi",
  TRANSIT: "Mezzi pubblici",
};

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

function DetailRow({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function RaiderDetailView({ raider }: { raider: RaiderDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Informazioni</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Email">{raider.user?.email ?? "—"}</DetailRow>
            <DetailRow label="Cellulare">{raider.mobile || "—"}</DetailRow>
            <DetailRow label="Veicolo">{VEHICLE_LABEL[raider.vehicle] ?? raider.vehicle}</DetailRow>
            <DetailRow label="Stato">
              <StatusBadge color={raider.isActive ? "success" : "default"}>
                {raider.isActive ? "Attivo" : "Disattivato"}
              </StatusBadge>
            </DetailRow>
            <DetailRow label="Consegne completate" full>
              {raider.historyDeliveries.length}
            </DetailRow>
            <DetailRow label="Attività collegate" full>
              <div className="flex flex-wrap gap-1">
                {raider.businessRelations.length
                  ? raider.businessRelations.map((rel) => (
                      <Badge key={rel.business.id} variant="secondary">
                        {rel.business.bussinesName}
                      </Badge>
                    ))
                  : "—"}
              </div>
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consegne assegnate recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordine</TableHead>
                <TableHead>Attività</TableHead>
                <TableHead>Programmata</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {raider.assignedDeliveries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nessuna consegna assegnata
                  </TableCell>
                </TableRow>
              )}
              {raider.assignedDeliveries.map((r) => (
                <TableRow key={r.delivery.id}>
                  <TableCell>{r.delivery.orderId ?? "—"}</TableCell>
                  <TableCell>{r.delivery.business?.bussinesName ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(r.delivery.schedulingDelivery)}</TableCell>
                  <TableCell>
                    <StatusBadge color={STATUS_COLOR[r.delivery.status] ?? "default"}>
                      {r.delivery.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
