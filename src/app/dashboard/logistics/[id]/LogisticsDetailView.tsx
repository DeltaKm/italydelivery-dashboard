import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import type { LogisticsDetail } from "@/lib/types";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default function LogisticsDetailView({ logistics }: { logistics: LogisticsDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Informazioni</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <DetailRow label="Email">{logistics.user?.email ?? "—"}</DetailRow>
            <DetailRow label="Stato">
              {logistics.user?.expired ? (
                <StatusBadge color="error">Disattivato</StatusBadge>
              ) : logistics.user?.confirmed ? (
                <StatusBadge color="success">Attivo</StatusBadge>
              ) : (
                <StatusBadge color="warning">Email da confermare</StatusBadge>
              )}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attività assegnate</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attività</TableHead>
                <TableHead>Indirizzo</TableHead>
                <TableHead className="text-right">Consegne completate</TableHead>
                <TableHead className="text-right">Consegne totali</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logistics.businessRelations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nessuna attività assegnata
                  </TableCell>
                </TableRow>
              )}
              {logistics.businessRelations.map((r) => (
                <TableRow key={r.business.id}>
                  <TableCell>{r.business.bussinesName}</TableCell>
                  <TableCell>{r.business.address}</TableCell>
                  <TableCell className="text-right">
                    {r.business.deliveries.filter((d) => d.status === "COMPLETED").length}
                  </TableCell>
                  <TableCell className="text-right">{r.business.deliveries.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
