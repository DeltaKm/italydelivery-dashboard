"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import StatusBadge from "@/components/StatusBadge";
import type { Delivery, RaiderListItem, DeliveryStatus } from "@/lib/types";
import type { Role } from "@/lib/session-constants";
import {
  reassignDeliveryAction,
  updateDeliveryAction,
  deleteDeliveryAction,
} from "@/lib/actions";
import { canEditDelivery, canChangeDeliveryStatus } from "@/lib/delivery-rules";

const STATUS_COLOR: Record<DeliveryStatus, "default" | "success" | "processing" | "warning" | "error"> = {
  CREATED: "default",
  ASSIGNED: "processing",
  ONDELIVERY: "warning",
  COMPLETED: "success",
  NOTDELIVERED: "error",
  DELETED: "default",
  RELEASED: "warning",
};

const STATUS_OPTIONS: DeliveryStatus[] = [
  "CREATED",
  "ASSIGNED",
  "ONDELIVERY",
  "COMPLETED",
  "NOTDELIVERED",
  "RELEASED",
  "DELETED",
];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(value: string) {
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DetailRow({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function DeliveryDetail({
  delivery,
  raiders,
  role,
}: {
  delivery: Delivery;
  raiders: RaiderListItem[];
  role: Role;
}) {
  const router = useRouter();
  const [selectedRaider, setSelectedRaider] = useState<string>(
    delivery.assignedToRaiderId ?? ""
  );
  const [reassignLoading, setReassignLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [status, setStatus] = useState<DeliveryStatus>(delivery.status);

  const editable = canEditDelivery(role, delivery);
  const canChangeStatus = canChangeDeliveryStatus(role);

  async function reassign() {
    if (!selectedRaider) return;
    setReassignLoading(true);
    const result = await reassignDeliveryAction(delivery.id, selectedRaider);
    setReassignLoading(false);
    if (result.ok) {
      toast.success("Raider riassegnato");
    } else {
      toast.error(result.message);
    }
  }

  async function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const schedulingRaw = String(formData.get("schedulingDelivery"));

    setEditLoading(true);
    const result = await updateDeliveryAction(delivery.id, {
      schedulingDelivery: schedulingRaw.replace("T", " ") + ":00",
      deliveryAddress: String(formData.get("deliveryAddress") || ""),
      mobile: String(formData.get("mobile") || ""),
      phone: String(formData.get("phone") || ""),
      totalPaid: Number(formData.get("totalPaid")),
      compensation: Number(formData.get("compensation")),
      note: String(formData.get("note") || ""),
      status: canChangeStatus ? status : undefined,
    });
    setEditLoading(false);
    if (result.ok) {
      toast.success("Consegna aggiornata");
    } else {
      toast.error(result.message);
    }
  }

  async function onDelete() {
    setDeleteLoading(true);
    const result = await deleteDeliveryAction(delivery.id);
    setDeleteLoading(false);
    if (result.ok) {
      toast.success(role === "ADMIN" ? "Consegna eliminata" : "Consegna cancellata");
      router.push("/dashboard/deliveries");
    } else {
      toast.error(result.message);
    }
  }

  const deleteDisabled = role === "BUSINESS" && delivery.isAssigned;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Dettagli consegna</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Attività">{delivery.name ?? "—"}</DetailRow>
            <DetailRow label="Stato">
              <StatusBadge color={STATUS_COLOR[delivery.status] ?? "default"}>
                {delivery.status}
              </StatusBadge>
            </DetailRow>
            <DetailRow label="Destinatario">{delivery.recipient ?? "—"}</DetailRow>
            <DetailRow label="Programmata">{formatDateTime(delivery.schedulingDelivery)}</DetailRow>
            <DetailRow label="Indirizzo ritiro" full>{delivery.pickupAddress ?? "—"}</DetailRow>
            <DetailRow label="Indirizzo consegna" full>{delivery.deliveryAddress ?? "—"}</DetailRow>
            <DetailRow label="Totale pagato dal cliente">
              € {delivery.totalPaid?.toFixed(2) ?? "0.00"}
            </DetailRow>
            <DetailRow label="Compenso raider">€ {delivery.compensation?.toFixed(2) ?? "0.00"}</DetailRow>
            <DetailRow label="Raider assegnato" full>
              {delivery.assignedToRaider
                ? `${delivery.assignedToRaider.name} ${delivery.assignedToRaider.surname}`
                : "Non assegnato"}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riassegna raider</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Select value={selectedRaider} onValueChange={(v) => setSelectedRaider(v ?? "")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleziona raider" />
            </SelectTrigger>
            <SelectContent>
              {raiders.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} {r.surname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={reassign}
            disabled={
              reassignLoading || !selectedRaider || selectedRaider === delivery.assignedToRaiderId
            }
          >
            {reassignLoading ? "Assegnazione..." : "Assegna"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modifica consegna</CardTitle>
        </CardHeader>
        <CardContent>
          {editable ? (
            <form onSubmit={onEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="schedulingDelivery">Data e ora consegna</Label>
                <Input
                  id="schedulingDelivery"
                  name="schedulingDelivery"
                  type="datetime-local"
                  defaultValue={toDatetimeLocalValue(delivery.schedulingDelivery)}
                  disabled={editLoading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deliveryAddress">Indirizzo di consegna</Label>
                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  defaultValue={delivery.deliveryAddress ?? ""}
                  disabled={editLoading}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="mobile">Cellulare</Label>
                  <Input id="mobile" name="mobile" defaultValue={delivery.mobile ?? ""} disabled={editLoading} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input id="phone" name="phone" defaultValue={delivery.phone ?? ""} disabled={editLoading} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="totalPaid">Totale pagato dal cliente (€)</Label>
                  <Input
                    id="totalPaid"
                    name="totalPaid"
                    type="number"
                    min={0}
                    step={0.5}
                    defaultValue={delivery.totalPaid}
                    disabled={editLoading}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="compensation">Compenso raider (€)</Label>
                  <Input
                    id="compensation"
                    name="compensation"
                    type="number"
                    min={0}
                    step={0.5}
                    defaultValue={delivery.compensation}
                    disabled={editLoading}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" name="note" rows={2} defaultValue={delivery.note ?? ""} disabled={editLoading} />
              </div>
              {canChangeStatus && (
                <div className="flex flex-col gap-1.5">
                  <Label>Stato</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as DeliveryStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" disabled={editLoading} className="w-fit">
                {editLoading ? "Salvataggio..." : "Salva modifiche"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Questo ordine non è più modificabile: è già stato assegnato a un raider.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Elimina consegna</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" disabled={deleteDisabled || deleteLoading} />}
            >
              {role === "ADMIN" ? "Elimina definitivamente" : "Cancella ordine"}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {role === "ADMIN"
                    ? "Eliminare definitivamente questa consegna?"
                    : "Cancellare questa consegna?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {role === "ADMIN"
                    ? "Azione irreversibile: rimuove la consegna e tutto lo storico collegato."
                    : "L'ordine verrà segnato come cancellato."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Conferma</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {deleteDisabled && (
            <p className="mt-2 text-sm text-muted-foreground">
              Non puoi cancellare un ordine già assegnato a un raider.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
