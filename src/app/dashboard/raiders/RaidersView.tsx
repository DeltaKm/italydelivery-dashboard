"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Check, Pencil, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import StatusBadge from "@/components/StatusBadge";
import BadgeListOverflow from "@/components/BadgeListOverflow";
import PasswordInput from "@/components/PasswordInput";
import EntityAvatar from "@/components/EntityAvatar";
import type { RaiderListItem, Business, Vehicle } from "@/lib/types";
import type { Role } from "@/lib/session-constants";
import {
  createRaiderAction,
  approveRaidersAction,
  updateRaiderAction,
  removeRaiderAction,
  setRaiderActiveAction,
  syncRaiderBusinessesAction,
  syncRaiderManagedBusinessesAction,
} from "@/lib/actions";

const VEHICLE_LABEL: Record<Vehicle, string> = {
  CAR: "Auto",
  BICYCLE: "Bicicletta",
  MOTORCYCLE: "Moto",
  VAN: "Furgone",
  REFRIGERATEDVAN: "Furgone refrigerato",
  WITHOUTVEHICLE: "A piedi",
  TRANSIT: "Mezzi pubblici",
};

const REMOVE_COPY: Record<Role, { title: string; description: string }> = {
  ADMIN: {
    title: "Eliminare definitivamente questo raider?",
    description:
      "Azione irreversibile: elimina raider e account collegato. Non è possibile se ha consegne attive.",
  },
  LOGISTICS: {
    title: "Rimuovere questo raider?",
    description: "Rimuove solo il collegamento con l'attività, il raider non viene eliminato.",
  },
  BUSINESS: {
    title: "Rimuovere questo raider?",
    description: "Rimuove solo il collegamento con la tua attività, il raider non viene eliminato.",
  },
  USER: { title: "Rimuovere?", description: "" },
  RAIDER: { title: "Rimuovere?", description: "" },
};

export default function RaidersView({
  raiders,
  businesses,
  role,
}: {
  raiders: RaiderListItem[];
  businesses: Business[];
  role: Role;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [editing, setEditing] = useState<RaiderListItem | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);
  const [editingBusinesses, setEditingBusinesses] = useState<RaiderListItem | null>(null);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);

  // Stato del form di creazione (i campi Select non sono nativi, servono controllati)
  const [vehicle, setVehicle] = useState<Vehicle | "">("");
  const [assignToBusinessIds, setAssignToBusinessIds] = useState<string[]>([]);
  const [editVehicle, setEditVehicle] = useState<Vehicle | "">("");

  const pending = raiders.filter((r) => r.confirmedFromBusiness === false);
  const activeRaiders = raiders.filter((r) => r.confirmedFromBusiness !== false);
  const active = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeRaiders;
    return activeRaiders.filter(
      (r) => `${r.name} ${r.surname}`.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
    );
  }, [activeRaiders, search]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!vehicle) {
      toast.error("Seleziona il veicolo");
      return;
    }
    if (role === "LOGISTICS" && assignToBusinessIds.length === 0) {
      toast.error("Seleziona almeno un'attività");
      return;
    }
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await createRaiderAction({
      name: String(formData.get("name")),
      surname: String(formData.get("surname")),
      vehicle,
      mobile: String(formData.get("mobile") || "") || undefined,
      businessIds: role === "LOGISTICS" ? assignToBusinessIds : undefined,
      assignToBusinessIds: role === "ADMIN" ? assignToBusinessIds : undefined,
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      imgUrl: role === "ADMIN" ? String(formData.get("imgUrl") || "") || undefined : undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Raider creato");
      setOpen(false);
      setVehicle("");
      setAssignToBusinessIds([]);
    } else {
      toast.error(result.message);
    }
  }

  async function approve(raiderId: string) {
    setApproving(raiderId);
    const result = await approveRaidersAction([raiderId]);
    setApproving(null);
    if (result.ok) {
      toast.success("Raider approvato");
    } else {
      toast.error(result.message);
    }
  }

  function openEditor(record: RaiderListItem) {
    setEditing(record);
    setEditVehicle(record.vehicle);
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await updateRaiderAction(editing.id, {
      name: String(formData.get("name")),
      surname: String(formData.get("surname")),
      vehicle: editVehicle || editing.vehicle,
      mobile: String(formData.get("mobile") || "") || undefined,
      email: role === "ADMIN" ? String(formData.get("email") || "") || undefined : undefined,
      imgUrl: role === "ADMIN" ? String(formData.get("imgUrl") || "") || undefined : undefined,
    });
    setLoading(false);
    if (result.ok) {
      toast.success("Raider aggiornato");
      setEditing(null);
    } else {
      toast.error(result.message);
    }
  }

  async function remove(id: string) {
    setRemoving(id);
    const result = await removeRaiderAction(id);
    setRemoving(null);
    if (result.ok) {
      toast.success("Raider rimosso");
    } else {
      toast.error(result.message);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setTogglingActive(id);
    const result = await setRaiderActiveAction(id, isActive);
    setTogglingActive(null);
    if (result.ok) {
      toast.success(isActive ? "Raider attivato" : "Raider disattivato");
    } else {
      toast.error(result.message);
    }
  }

  function toggleAssign(id: string, checked: boolean) {
    setAssignToBusinessIds((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)));
  }

  function openBusinessEditor(record: RaiderListItem) {
    setEditingBusinesses(record);
    setSelectedBusinesses((record.businesses ?? []).map((b) => b.id));
  }

  function toggleSelectedBusiness(id: string, checked: boolean) {
    setSelectedBusinesses((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)));
  }

  async function saveBusinesses() {
    if (!editingBusinesses) return;
    setLoading(true);
    const result =
      role === "LOGISTICS"
        ? await syncRaiderManagedBusinessesAction(editingBusinesses.id, selectedBusinesses)
        : await syncRaiderBusinessesAction(editingBusinesses.id, selectedBusinesses);
    setLoading(false);
    if (result.ok) {
      toast.success("Attività assegnate aggiornate");
      setEditingBusinesses(null);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Nuovo raider
        </Button>
        <Input
          placeholder="Cerca per nome o email"
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {role === "BUSINESS" && pending.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">Richieste in attesa di approvazione</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Veicolo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name} {r.surname}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{VEHICLE_LABEL[r.vehicle] ?? r.vehicle}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button size="sm" className="gap-1.5" disabled={approving === r.id} />}
                      >
                        <Check className="size-3.5" />
                        Approva
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approvare questo raider?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => approve(r.id)}>Conferma</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Veicolo</TableHead>
            <TableHead>Stato</TableHead>
            {role !== "BUSINESS" && <TableHead>Attività</TableHead>}
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {active.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nessun raider
              </TableCell>
            </TableRow>
          )}
          {active.map((r) => (
            <TableRow
              key={r.id}
              className={role === "ADMIN" ? "cursor-pointer" : undefined}
              onClick={role === "ADMIN" ? () => router.push(`/dashboard/raiders/${r.id}`) : undefined}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <EntityAvatar name={`${r.name} ${r.surname}`} imgUrl={r.imgUrl} size="sm" />
                  {r.name} {r.surname}
                </div>
              </TableCell>
              <TableCell>{r.email}</TableCell>
              <TableCell>{VEHICLE_LABEL[r.vehicle] ?? r.vehicle}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    checked={r.isActive}
                    disabled={togglingActive === r.id}
                    onCheckedChange={(checked) => toggleActive(r.id, checked === true)}
                  />
                  <StatusBadge color={r.isActive ? "success" : "default"}>
                    {r.isActive ? "Attivo" : "Disattivato"}
                  </StatusBadge>
                  {r.inService !== undefined && (
                    <StatusBadge color={r.inService ? "processing" : "default"}>
                      {r.inService ? "In servizio" : "Non in servizio"}
                    </StatusBadge>
                  )}
                </div>
              </TableCell>
              {role !== "BUSINESS" && (
                <TableCell>
                  <BadgeListOverflow
                    items={r.businesses ?? []}
                    title={`Attività di ${r.name} ${r.surname}`}
                  />
                </TableCell>
              )}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  {(role === "ADMIN" || role === "LOGISTICS") && (
                    <Button variant="outline" size="icon-sm" onClick={() => openBusinessEditor(r)}>
                      <Building2 className="size-3.5" />
                    </Button>
                  )}
                  <Button variant="outline" size="icon-sm" onClick={() => openEditor(r)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={<Button variant="destructive" size="icon-sm" disabled={removing === r.id} />}
                    >
                      <Trash2 className="size-3.5" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{REMOVE_COPY[role].title}</AlertDialogTitle>
                        <AlertDialogDescription>{REMOVE_COPY[role].description}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(r.id)}>Conferma</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nuovo raider</SheetTitle>
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
              <Label>Veicolo</Label>
              <Select value={vehicle} onValueChange={(v) => setVehicle((v ?? "") as Vehicle)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VEHICLE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mobile">Cellulare</Label>
              <Input id="mobile" name="mobile" disabled={loading} />
            </div>

            {(role === "ADMIN" || role === "LOGISTICS") && businesses.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>{role === "LOGISTICS" ? "Attività" : "Attività (opzionale)"}</Label>
                <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-lg border p-2">
                  {businesses.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={assignToBusinessIds.includes(b.id)}
                        onCheckedChange={(checked) => toggleAssign(b.id, checked === true)}
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email account</Label>
              <Input id="email" name="email" type="email" required disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password iniziale</Label>
              <PasswordInput id="password" name="password" minLength={6} required disabled={loading} />
            </div>
            {role === "ADMIN" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="imgUrl">URL immagine (opzionale)</Label>
                <Input id="imgUrl" name="imgUrl" type="url" placeholder="https://..." disabled={loading} />
              </div>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={loading}>
                {loading ? "Creazione..." : "Crea raider"}
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
                ? `Attività assegnate a ${editingBusinesses.name} ${editingBusinesses.surname}`
                : ""}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 overflow-y-auto px-4">
            {businesses.map((b) => (
              <label key={b.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={selectedBusinesses.includes(b.id)}
                  onCheckedChange={(checked) => toggleSelectedBusiness(b.id, checked === true)}
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

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Modifica ${editing.name} ${editing.surname}` : ""}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form id="edit-raider-form" onSubmit={saveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name">Nome</Label>
                <Input id="edit-name" name="name" defaultValue={editing.name} required disabled={loading} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-surname">Cognome</Label>
                <Input
                  id="edit-surname"
                  name="surname"
                  defaultValue={editing.surname}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Veicolo</Label>
                <Select value={editVehicle} onValueChange={(v) => setEditVehicle((v ?? "") as Vehicle)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(VEHICLE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-mobile">Cellulare</Label>
                <Input id="edit-mobile" name="mobile" disabled={loading} />
              </div>
              {role === "ADMIN" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-email">Email account</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editing.email} disabled={loading} />
                </div>
              )}
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
            </form>
          )}
          <DialogFooter>
            <Button type="submit" form="edit-raider-form" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
