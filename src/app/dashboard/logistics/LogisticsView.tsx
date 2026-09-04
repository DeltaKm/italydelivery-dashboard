"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Pencil, Ban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "@/components/StatusBadge";
import BadgeListOverflow from "@/components/BadgeListOverflow";
import PasswordInput from "@/components/PasswordInput";
import EntityAvatar from "@/components/EntityAvatar";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { LogisticsAccount, Business } from "@/lib/types";
import {
  syncLogisticsBusinessesAction,
  updateLogisticsAction,
  disableLogisticsAction,
  createLogisticsAction,
} from "@/lib/actions";

export default function LogisticsView({
  logistics,
  businesses,
}: {
  logistics: LogisticsAccount[];
  businesses: Business[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingBusinesses, setEditingBusinesses] = useState<LogisticsAccount | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingName, setEditingName] = useState<LogisticsAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await createLogisticsAction({
      name: String(formData.get("name")),
      surname: String(formData.get("surname")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      imgUrl: String(formData.get("imgUrl") || "") || undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Account Logistics creato");
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  }

  function openBusinessEditor(record: LogisticsAccount) {
    setEditingBusinesses(record);
    setSelected(record.assignedBusinesses.map((b) => b.id));
  }

  function toggleBusiness(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)));
  }

  async function saveBusinesses() {
    if (!editingBusinesses) return;
    setLoading(true);
    const result = await syncLogisticsBusinessesAction(editingBusinesses.id, selected);
    setLoading(false);
    if (result.ok) {
      toast.success("Business assegnati aggiornati");
      setEditingBusinesses(null);
    } else {
      toast.error(result.message);
    }
  }

  async function saveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingName) return;
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await updateLogisticsAction(editingName.id, {
      name: String(formData.get("name")),
      surname: String(formData.get("surname")),
      imgUrl: String(formData.get("imgUrl") || "") || undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Nome aggiornato");
      setEditingName(null);
    } else {
      toast.error(result.message);
    }
  }

  async function disable(id: string) {
    setDisabling(id);
    const result = await disableLogisticsAction(id);
    setDisabling(null);
    if (result.ok) {
      toast.success("Account disattivato");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Gli account Logistics possono auto-registrarsi oppure essere creati direttamente da qui.
        Da qui assegni loro anche le attività da gestire.
      </p>

      <div className="mb-4">
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Nuovo Logistics
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Business assegnati</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {logistics.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nessun account Logistics
              </TableCell>
            </TableRow>
          )}
          {logistics.map((r) => (
            <TableRow
              key={r.id}
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/logistics/${r.id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <EntityAvatar name={`${r.name} ${r.surname}`} imgUrl={r.imgUrl} size="sm" />
                  {r.name} {r.surname}
                </div>
              </TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>
                <BadgeListOverflow
                  items={r.assignedBusinesses}
                  title={`Attività assegnate a ${r.name} ${r.surname}`}
                />
              </TableCell>
              <TableCell>
                {r.expired ? (
                  <StatusBadge color="error">Disattivato</StatusBadge>
                ) : r.confirmed ? (
                  <StatusBadge color="success">Attivo</StatusBadge>
                ) : (
                  <StatusBadge color="warning">Email da confermare</StatusBadge>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openBusinessEditor(r)}>
                    <Users className="size-3.5" />
                    Assegna business
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={() => setEditingName(r)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  {!r.expired && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button variant="destructive" size="icon-sm" disabled={disabling === r.id} />
                        }
                      >
                        <Ban className="size-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disattivare questo account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Non potrà più accedere. Puoi riattivarlo da Utenti.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => disable(r.id)}>Conferma</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nuovo Logistics</SheetTitle>
          </SheetHeader>
          <form onSubmit={onCreate} className="flex flex-col gap-4 overflow-y-auto px-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="surname">Cognome</Label>
              <Input id="surname" name="surname" required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email account</Label>
              <Input id="email" name="email" type="email" required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password iniziale</Label>
              <PasswordInput id="password" name="password" minLength={6} required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="imgUrl">URL immagine (opzionale)</Label>
              <Input id="imgUrl" name="imgUrl" type="url" placeholder="https://..." disabled={loading} />
            </div>
            <SheetFooter className="px-0">
              <Button type="submit" disabled={loading}>
                {loading ? "Creazione..." : "Crea Logistics"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={!!editingBusinesses} onOpenChange={(v) => !v && setEditingBusinesses(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingBusinesses
                ? `Business assegnati a ${editingBusinesses.name} ${editingBusinesses.surname}`
                : ""}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 overflow-y-auto px-4">
            {businesses.map((b) => (
              <label key={b.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(b.id)}
                  onCheckedChange={(checked) => toggleBusiness(b.id, checked === true)}
                />
                <span>
                  {b.name} — <span className="text-muted-foreground">{b.address}</span>
                </span>
              </label>
            ))}
            {businesses.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessuna attività disponibile.</p>
            )}
          </div>
          <SheetFooter>
            <Button onClick={saveBusinesses} disabled={loading}>
              {loading ? "Salvataggio..." : "Salva"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={!!editingName} onOpenChange={(v) => !v && setEditingName(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica account</DialogTitle>
          </DialogHeader>
          {editingName && (
            <form id="edit-name-form" onSubmit={saveName} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" defaultValue={editingName.name} required disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="surname">Cognome</Label>
                <Input
                  id="surname"
                  name="surname"
                  defaultValue={editingName.surname}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-imgUrl">URL immagine (opzionale)</Label>
                <Input
                  id="edit-imgUrl"
                  name="imgUrl"
                  type="url"
                  placeholder="https://..."
                  defaultValue={editingName.imgUrl ?? ""}
                  disabled={loading}
                />
              </div>
            </form>
          )}
          <DialogFooter>
            <Button type="submit" form="edit-name-form" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
