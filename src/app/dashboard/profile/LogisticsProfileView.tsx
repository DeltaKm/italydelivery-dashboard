"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LogisticsProfile } from "@/lib/types";
import { updateOwnLogisticsProfileAction } from "@/lib/actions";

export default function LogisticsProfileView({ profile }: { profile: LogisticsProfile }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await updateOwnLogisticsProfileAction({
      name: String(formData.get("name")),
      surname: String(formData.get("surname")),
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
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="text-sm">{profile.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Attività assegnate</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {profile.businesses.length
                  ? profile.businesses.map((b) => (
                      <Badge key={b.id} variant="secondary">
                        {b.name}
                      </Badge>
                    ))
                  : "Nessuna"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dati personali</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" defaultValue={profile.name} required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="surname">Cognome</Label>
              <Input
                id="surname"
                name="surname"
                defaultValue={profile.surname}
                required
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
