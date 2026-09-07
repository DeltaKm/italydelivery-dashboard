"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/StatusBadge";
import DataPagination from "@/components/DataPagination";
import type { UserAccount } from "@/lib/types";
import { setUserStatusAction, setUserRoleAction } from "@/lib/actions";

const ALL_ROLES: UserAccount["role"][] = ["ADMIN", "LOGISTICS", "BUSINESS", "RAIDER", "USER"];
const PAGE_SIZE = 15;

type PendingRoleChange = { user: UserAccount; newRole: UserAccount["role"] };

export default function UsersView({ users }: { users: UserAccount[] }) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserAccount["role"] | "">("");
  const [pendingRoleChange, setPendingRoleChange] = useState<PendingRoleChange | null>(null);
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (q && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const paginated = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function toggle(userId: string, expired: boolean) {
    setPendingStatus(userId);
    const result = await setUserStatusAction(userId, expired);
    setPendingStatus(null);
    if (result.ok) {
      toast.success(expired ? "Utente disattivato" : "Utente attivato");
    } else {
      toast.error(result.message);
    }
  }

  async function confirmRoleChange() {
    if (!pendingRoleChange) return;
    setSavingRole(pendingRoleChange.user.id);
    const result = await setUserRoleAction(pendingRoleChange.user.id, pendingRoleChange.newRole);
    setSavingRole(null);
    setPendingRoleChange(null);
    if (!result.ok) toast.error(result.message);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cerca per email"
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter((v ?? "") as UserAccount["role"])}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtra per ruolo" />
          </SelectTrigger>
          <SelectContent>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Ruolo</TableHead>
            <TableHead>Email confermata</TableHead>
            <TableHead>Attivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Nessun utente
              </TableCell>
            </TableRow>
          )}
          {paginated.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(newRole) => {
                    if (!newRole || newRole === user.role) return;
                    setPendingRoleChange({ user, newRole: newRole as UserAccount["role"] });
                  }}
                >
                  <SelectTrigger size="sm" className="w-32" disabled={savingRole === user.id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {user.confirmed ? (
                  <StatusBadge color="success">Sì</StatusBadge>
                ) : (
                  <StatusBadge color="warning">No</StatusBadge>
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={!user.expired}
                  disabled={user.role === "ADMIN" || pendingStatus === user.id}
                  onCheckedChange={(checked) => toggle(user.id, !checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredUsers.length > 0 && (
        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filteredUsers.length}
          onPageChange={setPage}
          label="utenti"
        />
      )}

      <AlertDialog
        open={!!pendingRoleChange}
        onOpenChange={(v) => !v && setPendingRoleChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cambiare ruolo a {pendingRoleChange?.newRole}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa operazione cambia solo l&apos;etichetta del ruolo, non crea né rimuove il
              profilo collegato (Business/Logistics/Raider). Se il ruolo non corrisponde al
              profilo esistente, l&apos;utente potrebbe perdere l&apos;accesso a funzioni del
              pannello.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Cambia ruolo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
