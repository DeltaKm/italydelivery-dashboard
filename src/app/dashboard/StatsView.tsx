import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import CsvExportButton from "@/components/CsvExportButton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { AdminStats, LogisticsStats, BusinessStats } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

function StatCard({
  title,
  value,
  suffix,
}: {
  title: string;
  value: number | string;
  suffix?: string;
}) {
  const display =
    typeof value === "number"
      ? value.toLocaleString("it-IT")
      : Number(value).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Card size="sm">
      <CardContent>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">
          {display}
          {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>;
}

function AdminView({ stats }: { stats: AdminStats }) {
  return (
    <div className="flex flex-col gap-6">
      <StatGrid>
        <StatCard title="Attività" value={stats.overview.totalBusinesses} />
        <StatCard title="Logistics" value={stats.overview.totalLogistics} />
        <StatCard
          title="Raider attivi"
          value={stats.overview.activeRaiders}
          suffix={`/ ${stats.overview.totalRaiders}`}
        />
        <StatCard title="Utenti totali" value={stats.overview.totalUsers} />
      </StatGrid>

      <StatGrid>
        <StatCard title="Consegne totali" value={stats.deliveries.total} />
        <StatCard title="Completate" value={stats.deliveries.byStatus.completed} />
        <StatCard title="In corso" value={stats.deliveries.byStatus.onDelivery} />
        <StatCard title="Non consegnate" value={stats.deliveries.byStatus.notDelivered} />
      </StatGrid>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard title="Ricavi totali" value={stats.financial.totalRevenue} suffix="€" />
        <StatCard
          title="Compensi raider (completate)"
          value={stats.financial.completedCompensation ?? stats.financial.totalCompensation}
          suffix="€"
        />
        <StatCard title="Profitto netto" value={stats.financial.netProfit} suffix="€" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top attività</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attività</TableHead>
                  <TableHead className="text-right">Ordini</TableHead>
                  <TableHead className="text-right">Completati</TableHead>
                  <TableHead className="text-right">Compensi raider</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topBusinesses.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell className="text-right">{b.totalOrders}</TableCell>
                    <TableCell className="text-right">{b.completedOrders}</TableCell>
                    <TableCell className="text-right">€ {b.totalCompensation.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top raider</CardTitle>
            <CardAction>
              <CsvExportButton
                filename="top-raider.csv"
                headers={["Raider", "Assegnate", "Completate", "Non consegnate", "% successo", "Da pagare (€)"]}
                rows={stats.topRaiders.map((r) => [
                  r.name,
                  r.totalAssigned,
                  r.completedDeliveries,
                  r.notDelivered,
                  r.successRate,
                  r.compensation,
                ])}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raider</TableHead>
                  <TableHead className="text-right">Assegnate</TableHead>
                  <TableHead className="text-right">Completate</TableHead>
                  <TableHead className="text-right">Non consegnate</TableHead>
                  <TableHead className="text-right">% successo</TableHead>
                  <TableHead className="text-right">Da pagare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topRaiders.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right">{r.totalAssigned}</TableCell>
                    <TableCell className="text-right">{r.completedDeliveries}</TableCell>
                    <TableCell className="text-right">{r.notDelivered}</TableCell>
                    <TableCell className="text-right">{r.successRate}</TableCell>
                    <TableCell className="text-right">€ {r.compensation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LogisticsAdminView({ stats }: { stats: LogisticsStats }) {
  return (
    <div className="flex flex-col gap-6">
      <StatGrid>
        <StatCard title="Attività gestite" value={stats.overview.totalBusinesses} />
        <StatCard
          title="Raider attivi"
          value={stats.overview.activeRaiders}
          suffix={`/ ${stats.overview.totalRaiders}`}
        />
        <StatCard title="Consegne totali" value={stats.overview.totalDeliveries} />
        <StatCard title="Completate" value={stats.overview.completedDeliveries} />
      </StatGrid>
      <StatGrid>
        <StatCard title="Create" value={stats.deliveries.byStatus.created} />
        <StatCard title="Assegnate" value={stats.deliveries.byStatus.assigned} />
        <StatCard title="In consegna" value={stats.deliveries.byStatus.onDelivery} />
        <StatCard title="Non consegnate" value={stats.deliveries.byStatus.notDelivered} />
      </StatGrid>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard title="Ricavi totali" value={stats.financial.totalRevenue} suffix="€" />
        <StatCard
          title="Compensi raider (completate)"
          value={stats.financial.completedCompensation ?? stats.financial.totalCompensation}
          suffix="€"
        />
        <StatCard title="Profitto netto" value={stats.financial.netProfit} suffix="€" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attività gestite</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attività</TableHead>
                <TableHead className="text-right">Ordini</TableHead>
                <TableHead className="text-right">Completati</TableHead>
                <TableHead className="text-right">Compensi raider</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.businesses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nessuna attività assegnata
                  </TableCell>
                </TableRow>
              )}
              {stats.businesses.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell className="text-right">{b.totalOrders}</TableCell>
                  <TableCell className="text-right">{b.completedOrders}</TableCell>
                  <TableCell className="text-right">€ {b.totalCompensation.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance e compensi raider</CardTitle>
          <CardAction>
            <CsvExportButton
              filename="performance-raider.csv"
              headers={["Raider", "Assegnate", "Completate", "Non consegnate", "% successo", "Da pagare (€)"]}
              rows={stats.raiders.map((r) => [
                r.raiderName,
                r.totalAssigned,
                r.completed,
                r.notDelivered,
                r.successRate,
                r.compensation,
              ])}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raider</TableHead>
                <TableHead className="text-right">Assegnate</TableHead>
                <TableHead className="text-right">Completate</TableHead>
                <TableHead className="text-right">Non consegnate</TableHead>
                <TableHead className="text-right">% successo</TableHead>
                <TableHead className="text-right">Da pagare</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.raiders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    Nessun raider con consegne nel periodo
                  </TableCell>
                </TableRow>
              )}
              {stats.raiders.map((r) => (
                <TableRow key={r.raiderId}>
                  <TableCell>{r.raiderName}</TableCell>
                  <TableCell className="text-right">{r.totalAssigned}</TableCell>
                  <TableCell className="text-right">{r.completed}</TableCell>
                  <TableCell className="text-right">{r.notDelivered}</TableCell>
                  <TableCell className="text-right">{r.successRate}</TableCell>
                  <TableCell className="text-right">€ {r.compensation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessView({ stats }: { stats: BusinessStats }) {
  return (
    <div className="flex flex-col gap-6">
      <StatGrid>
        <StatCard title="Ordini totali" value={stats.orders.total} />
        <StatCard title="Completati" value={stats.orders.byStatus.completed} />
        <StatCard title="In corso" value={stats.orders.byStatus.onDelivery} />
        <StatCard title="Non consegnati" value={stats.orders.byStatus.notDelivered} />
      </StatGrid>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard title="Ricavi totali" value={stats.financial.totalRevenue} suffix="€" />
        <StatCard
          title="Compensi raider (completate)"
          value={stats.financial.completedCompensation ?? stats.financial.totalCompensation}
          suffix="€"
        />
        <StatCard title="Profitto netto" value={stats.financial.netProfit} suffix="€" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance raider</CardTitle>
          <CardAction>
            <CsvExportButton
              filename="performance-raider.csv"
              headers={["Raider", "Assegnate", "Completate", "Non consegnate", "% successo", "Da pagare (€)"]}
              rows={stats.raiders.performance.map((r) => [
                r.raiderName,
                r.totalAssigned,
                r.completed,
                r.notDelivered,
                r.successRate,
                r.compensation,
              ])}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raider</TableHead>
                <TableHead className="text-right">Assegnate</TableHead>
                <TableHead className="text-right">Completate</TableHead>
                <TableHead className="text-right">Non consegnate</TableHead>
                <TableHead className="text-right">% successo</TableHead>
                <TableHead className="text-right">Da pagare</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.raiders.performance.map((r) => (
                <TableRow key={r.raiderId}>
                  <TableCell>{r.raiderName}</TableCell>
                  <TableCell className="text-right">{r.totalAssigned}</TableCell>
                  <TableCell className="text-right">{r.completed}</TableCell>
                  <TableCell className="text-right">{r.notDelivered}</TableCell>
                  <TableCell className="text-right">{r.successRate}</TableCell>
                  <TableCell className="text-right">€ {r.compensation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StatsView({
  role,
  stats,
}: {
  role: Role;
  stats: AdminStats | LogisticsStats | BusinessStats;
}) {
  if (role === "ADMIN") return <AdminView stats={stats as AdminStats} />;
  if (role === "LOGISTICS") return <LogisticsAdminView stats={stats as LogisticsStats} />;
  return <BusinessView stats={stats as BusinessStats} />;
}
