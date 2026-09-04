"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { BusinessProfile } from "@/lib/types";
import { updateOwnBusinessProfileAction } from "@/lib/actions";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function BusinessProfileView({ profile }: { profile: BusinessProfile }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await updateOwnBusinessProfileAction({
      bussinesName: String(formData.get("bussinesName")),
      address: String(formData.get("address")),
      businessCord: String(formData.get("businessCord") || "") || undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Profilo aggiornato");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Email">{profile.user.email}</DetailRow>
            <DetailRow label="Raider abilitati">{profile.business.raiderActived.length}</DetailRow>
            <DetailRow label="Cliente dal">
              {new Date(profile.business.createdAt).toLocaleDateString("it-IT")}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dati attività</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bussinesName">Nome attività</Label>
              <Input
                id="bussinesName"
                name="bussinesName"
                defaultValue={profile.business.name}
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                name="address"
                defaultValue={profile.business.address}
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessCord">Coordinate (lat,lng)</Label>
              <Input
                id="businessCord"
                name="businessCord"
                defaultValue={profile.business.coordinates ?? ""}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-fit" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva modifiche"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
