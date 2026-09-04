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
import { Card, CardContent } from "@/components/ui/card";
import type { Business } from "@/lib/types";
import type { Role } from "@/lib/session-constants";
import { createDeliveryAction } from "@/lib/actions";

const PAYMENT_TYPES = ["Contrassegno", "Carta", "Già pagato"];

export default function DeliveryForm({
  role,
  businesses,
}: {
  role: Role;
  businesses: Business[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const schedulingRaw = String(formData.get("schedulingDelivery"));
    if (!schedulingRaw) {
      toast.error("Seleziona data e ora della consegna");
      return;
    }
    if (role === "LOGISTICS" && !businessId) {
      toast.error("Seleziona l'attività");
      return;
    }
    if (!paymentType) {
      toast.error("Seleziona il tipo di pagamento");
      return;
    }

    // input datetime-local -> "YYYY-MM-DD HH:mm:ss" atteso dal backend
    const schedulingDelivery = schedulingRaw.replace("T", " ") + ":00";

    setLoading(true);
    const result = await createDeliveryAction({
      businessId: role === "LOGISTICS" ? businessId : undefined,
      orderId: String(formData.get("orderId") || "") || undefined,
      schedulingDelivery,
      customerName: String(formData.get("customerName")),
      customerSurname: String(formData.get("customerSurname")),
      deliveryAddress: String(formData.get("deliveryAddress")),
      paymentType,
      totalPaid: Number(formData.get("totalPaid")),
      totalShipping: Number(formData.get("totalShipping")),
      mobile: String(formData.get("mobile") || "") || undefined,
      phone: String(formData.get("phone") || "") || undefined,
      deliveryType: String(formData.get("deliveryType") || "") || undefined,
      note: String(formData.get("note") || "") || undefined,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Consegna creata");
      router.push("/dashboard/deliveries");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {role === "LOGISTICS" && (
            <div className="flex flex-col gap-1.5">
              <Label>Attività</Label>
              <Select value={businessId} onValueChange={(v) => setBusinessId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona attività" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="orderId">Numero ordine (opzionale)</Label>
            <Input id="orderId" name="orderId" placeholder="Generato automaticamente se vuoto" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schedulingDelivery">Data e ora consegna</Label>
            <Input
              id="schedulingDelivery"
              name="schedulingDelivery"
              type="datetime-local"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customerName">Nome cliente</Label>
              <Input id="customerName" name="customerName" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customerSurname">Cognome cliente</Label>
              <Input id="customerSurname" name="customerSurname" required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deliveryAddress">Indirizzo di consegna</Label>
            <Input id="deliveryAddress" name="deliveryAddress" placeholder="Via, città, CAP" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mobile">Cellulare</Label>
              <Input id="mobile" name="mobile" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" name="phone" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tipo pagamento</Label>
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="totalPaid">Totale pagato dal cliente (€)</Label>
              <Input id="totalPaid" name="totalPaid" type="number" min={0} step={0.5} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="totalShipping">Compenso per il raider (€)</Label>
              <Input
                id="totalShipping"
                name="totalShipping"
                type="number"
                min={0}
                step={0.5}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deliveryType">Categoria</Label>
            <Input id="deliveryType" name="deliveryType" placeholder="Generico, Alimenti, Farmaci…" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" name="note" rows={2} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creazione..." : "Crea consegna"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
