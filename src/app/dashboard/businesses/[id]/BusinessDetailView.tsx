"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Network } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import type { BusinessDetail, DeliveryStatus } from "@/lib/types";
import type { Role } from "@/lib/session-constants";
import { syncBusinessLogisticsAction, syncBusinessRaidersAction } from "@/lib/actions";

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

export default function BusinessDetailView({
  business,
  role,
  allRaiders,
  allLogistics,
}: {
  business: BusinessDetail;
  role: Role;
  allRaiders: { id: string; name: string; surname: string }[];
  allLogistics: { id: string; name: string; surname: string }[];
}) {
  const [raidersOpen, setRaidersOpen] = useState(false);
  const [logisticsOpen, setLogisticsOpen] = useState(false);
  const [selectedRaiders, setSelectedRaiders] = useState<string[]>([]);
  const [selectedLogistics, setSelectedLogistics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function openRaidersEditor() {
    setSelectedRaiders(business.raiderRelations.map((r) => r.raider.id));
    setRaidersOpen(true);
  }

  function openLogisticsEditor() {
    setSelectedLogistics(business.logisticsRelations.map((r) => r.logistics.id));
    setLogisticsOpen(true);
  }

  function toggleRaider(id: string, checked: boolean) {
    setSelectedRaiders((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)));
  }

  function toggleLogistics(id: string, checked: boolean) {
    setSelectedLogistics((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)));
  }

  async function saveRaiders() {
    setLoading(true);
    const result = await syncBusinessRaidersAction(business.id, selectedRaiders);
    setLoading(false);
    if (result.ok) {
      toast.success("Raider aggiornati");
      setRaidersOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  async function saveLogistics() {
    setLoading(true);
    const result = await syncBusinessLogisticsAction(business.id, selectedLogistics);
    setLoading(false);
    if (result.ok) {
      toast.success("Logistiche aggiornate");
      setLogisticsOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Informazioni</CardTitle>
          {role === "ADMIN" && (
            <CardAction>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={openLogisticsEditor}>
                <Network className="size-3.5" />
                Assegna logistica
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Indirizzo" full>{business.address}</DetailRow>
            <DetailRow label="Coordinate">{business.businessCord || "—"}</DetailRow>
            <DetailRow label="Email">{business.user?.email ?? "—"}</DetailRow>
            <DetailRow label="Stato" full>
              {business.user?.expired ? (
                <StatusBadge color="error">Disattivato</StatusBadge>
              ) : business.user?.confirmed ? (
                <StatusBadge color="success">Attivo</StatusBadge>
              ) : (
                <StatusBadge color="warning">Email da confermare</StatusBadge>
              )}
            </DetailRow>
            <DetailRow label="Logistics" full>
              {business.logisticsRelations?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {business.logisticsRelations.map((rel) => (
                    <Badge key={rel.logistics.id} variant="secondary">
                      {rel.logistics.name} {rel.logistics.surname}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">Nessuna</span>
              )}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raider collegati</CardTitle>
          {role === "ADMIN" && (
            <CardAction>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={openRaidersEditor}>
                <Users className="size-3.5" />
                Assegna raider
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {business.raiderRelations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                    Nessun raider collegato
                  </TableCell>
                </TableRow>
              )}
              {business.raiderRelations.map((r) => (
                <TableRow key={r.raider.id}>
                  <TableCell>{r.raider.name} {r.raider.surname}</TableCell>
                  <TableCell>{r.raider.user?.email ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <StatusBadge color={r.raider.isActive ? "success" : "default"}>
                        {r.raider.isActive ? "Attivo" : "Disattivato"}
                      </StatusBadge>
                      {!r.confirmedFromBusiness && <StatusBadge color="warning">Da approvare</StatusBadge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consegne recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordine</TableHead>
                <TableHead>Programmata</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Compenso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {business.deliveries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nessuna consegna
                  </TableCell>
                </TableRow>
              )}
              {business.deliveries.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.orderId ?? "—"}</TableCell>
                  <TableCell>{formatDateTime(d.schedulingDelivery)}</TableCell>
                  <TableCell>
                    <StatusBadge color={STATUS_COLOR[d.status] ?? "default"}>{d.status}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">€ {d.compensation?.toFixed(2) ?? "0.00"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {business.deliveries.length >= 20 && (
            <p className="mt-2 text-sm text-muted-foreground">Mostrate le ultime 20 consegne.</p>
          )}
        </CardContent>
      </Card>

      <Sheet open={raidersOpen} onOpenChange={setRaidersOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Raider assegnati a {business.bussinesName}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 overflow-y-auto px-4">
            {allRaiders.map((r) => (
              <label key={r.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={selectedRaiders.includes(r.id)}
                  onCheckedChange={(checked) => toggleRaider(r.id, checked === true)}
                />
                <span>{r.name} {r.surname}</span>
              </label>
            ))}
            {allRaiders.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessun raider disponibile.</p>
            )}
          </div>
          <SheetFooter>
            <Button onClick={saveRaiders} disabled={loading}>
              {loading ? "Salvataggio..." : "Salva"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={logisticsOpen} onOpenChange={setLogisticsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Logistiche assegnate a {business.bussinesName}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 overflow-y-auto px-4">
            {allLogistics.map((l) => (
              <label key={l.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={selectedLogistics.includes(l.id)}
                  onCheckedChange={(checked) => toggleLogistics(l.id, checked === true)}
                />
                <span>{l.name} {l.surname}</span>
              </label>
            ))}
            {allLogistics.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessuna logistica disponibile.</p>
            )}
          </div>
          <SheetFooter>
            <Button onClick={saveLogistics} disabled={loading}>
              {loading ? "Salvataggio..." : "Salva"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
