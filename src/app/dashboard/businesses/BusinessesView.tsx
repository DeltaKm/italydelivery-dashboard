"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Ban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
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
import BadgeListOverflow from "@/components/BadgeListOverflow";
import type { Business } from "@/lib/types";
import type { Role } from "@/lib/session-constants";
import {
  createBusinessAction,
  updateBusinessAction,
  disableBusinessAction,
  setBusinessStatusAction,
} from "@/lib/actions";

export default function BusinessesView({
  businesses,
  role,
}: {
  businesses: Business[];
  role: Role;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await createBusinessAction({
      bussinesName: String(formData.get("bussinesName")),
      address: String(formData.get("address")),
      businessCord: String(formData.get("businessCord") || "") || undefined,
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      imgUrl: role === "ADMIN" ? String(formData.get("imgUrl") || "") || undefined : undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Attività creata. È stata inviata un'email di conferma.");
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  async function onEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await updateBusinessAction(editing.id, {
      bussinesName: String(formData.get("bussinesName")),
      address: String(formData.get("address")),
      businessCord: String(formData.get("businessCord") || "") || undefined,
      imgUrl: role === "ADMIN" ? String(formData.get("imgUrl") || "") || undefined : undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Attività aggiornata");
      setEditing(null);
    } else {
      toast.error(result.message);
    }
  }

  async function disable(id: string) {
    setDisabling(id);
    const result = await disableBusinessAction(id);
    setDisabling(null);
    if (result.ok) {
      toast.success("Attività disattivata");
    } else {
      toast.error(result.message);
    }
  }

  // Solo LOGISTICS: a differenza del disable ADMIN sopra, questo endpoint
  // permette anche la riattivazione.
  async function setStatus(id: string, expired: boolean) {
    setDisabling(id);
    const result = await setBusinessStatusAction(id, expired);
    setDisabling(null);
    if (result.ok) {
      toast.success(expired ? "Attività disattivata" : "Attività attivata");
    } else {
      toast.error(result.message);
    }
  }

  const filteredBusinesses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter(
      (b) => b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
    );
  }, [businesses, search]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Nuova attività
        </Button>
        <Input
          placeholder="Cerca per nome o indirizzo"
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Indirizzo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Raider attivi</TableHead>
            <TableHead>Ordini</TableHead>
            <TableHead>Logistics</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBusinesses.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                Nessuna attività
              </TableCell>
            </TableRow>
          )}
          {filteredBusinesses.map((business) => (
            <TableRow
              key={business.id}
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/businesses/${business.id}`)}
            >
              <TableCell className="font-medium">{business.name}</TableCell>
              <TableCell className="max-w-48 truncate">{business.address}</TableCell>
              <TableCell>{business.email}</TableCell>
              <TableCell className="text-center">{business.activeRaiders}</TableCell>
              <TableCell>
                {business.stats.completedOrders} / {business.stats.totalOrders}
              </TableCell>
              <TableCell>
                <BadgeListOverflow
                  items={business.assignedLogistics ?? []}
                  title={`Logistics assegnati a ${business.name}`}
                />
              </TableCell>
              <TableCell>
                {business.expired ? (
                  <StatusBadge color="error">Disattivato</StatusBadge>
                ) : business.confirmed ? (
                  <StatusBadge color="success">Attivo</StatusBadge>
                ) : (
                  <StatusBadge color="warning">Email da confermare</StatusBadge>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setEditing(business)}
                  >
                    <Pencil className="size-3.5" />
                    Modifica
                  </Button>
                  {role === "ADMIN" && !business.expired && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5"
                            disabled={disabling === business.id}
                          />
                        }
                      >
                        <Ban className="size-3.5" />
                        Disattiva
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disattivare questa attività?</AlertDialogTitle>
                          <AlertDialogDescription>
                            L&apos;account non potrà più accedere. Puoi riattivarlo in seguito da
                            Utenti.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => disable(business.id)}>
                            Conferma
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {role === "LOGISTICS" &&
                    (business.expired ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={disabling === business.id}
                        onClick={() => setStatus(business.id, false)}
                      >
                        <Check className="size-3.5" />
                        Attiva
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1.5"
                              disabled={disabling === business.id}
                            />
                          }
                        >
                          <Ban className="size-3.5" />
                          Disattiva
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Disattivare questa attività?</AlertDialogTitle>
                            <AlertDialogDescription>
                              L&apos;account non potrà più accedere. Potrai riattivarlo in
                              qualsiasi momento da qui.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setStatus(business.id, true)}>
                              Conferma
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nuova attività</SheetTitle>
          </SheetHeader>
          <form onSubmit={onCreate} className="flex flex-col gap-4 overflow-y-auto px-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bussinesName">Nome attività</Label>
              <Input id="bussinesName" name="bussinesName" placeholder="Es. Pizzeria da Mario" required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Indirizzo</Label>
              <Input id="address" name="address" required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessCord">Coordinate (lat,lng)</Label>
              <Input id="businessCord" name="businessCord" placeholder="41.9028,12.4964" disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email account</Label>
              <Input id="email" name="email" type="email" required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password iniziale</Label>
              <Input id="password" name="password" type="password" minLength={6} required disabled={loading} />
            </div>
            {role === "ADMIN" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="imgUrl">URL immagine (opzionale)</Label>
                <Input id="imgUrl" name="imgUrl" type="url" placeholder="https://..." disabled={loading} />
              </div>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={loading}>
                {loading ? "Creazione..." : "Crea attività"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? `Modifica ${editing.name}` : ""}</SheetTitle>
          </SheetHeader>
          {editing && (
            <form onSubmit={onEdit} className="flex flex-col gap-4 overflow-y-auto px-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-bussinesName">Nome attività</Label>
                <Input
                  id="edit-bussinesName"
                  name="bussinesName"
                  defaultValue={editing.name}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-address">Indirizzo</Label>
                <Input
                  id="edit-address"
                  name="address"
                  defaultValue={editing.address}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-businessCord">Coordinate (lat,lng)</Label>
                <Input
                  id="edit-businessCord"
                  name="businessCord"
                  defaultValue={editing.coordinates ?? ""}
                  disabled={loading}
                />
              </div>
              {role === "ADMIN" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-imgUrl">URL immagine (opzionale)</Label>
                  <Input
                    id="edit-imgUrl"
                    name="imgUrl"
                    type="url"
                    placeholder="https://..."
                    defaultValue={editing.imgUrl ?? ""}
                    disabled={loading}
                  />
                </div>
              )}
              <SheetFooter className="px-0">
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvataggio..." : "Salva modifiche"}
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
