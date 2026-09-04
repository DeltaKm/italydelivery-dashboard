"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AdminStats, LogisticsStats, BusinessStats } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

// Stessa semantica di StatusBadge.tsx (success/processing/warning/error/default)
const STATUS_COLORS: Record<string, string> = {
  default: "#9ca3af",
  processing: "#3b82f6",
  warning: "#f59e0b",
  success: "#10b981",
  error: "#ef4444",
  cancelled: "#94a3b8",
};

// Palette per grafici a torta (classifiche con molte voci diverse)
const PIE_PALETTE = [
  "#263573",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

const CHART_CONFIG = {
  value: { label: "Valore" },
} satisfies ChartConfig;

function ColoredPieChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; color: string }[];
}) {
  const config = Object.fromEntries(
    data.map((d) => [d.label, { label: d.label, color: d.color }])
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-56">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  hideIndicator
                  nameKey="label"
                  formatter={(value, name) => (
                    <div className="flex w-full min-w-40 items-center justify-between gap-3">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {typeof value === "number" ? value.toLocaleString() : String(value)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie data={data} dataKey="value" nameKey="label" outerRadius={80}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 flex flex-col divide-y divide-border border-t border-border">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 py-1.5 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1 truncate">{entry.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ColoredBarChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number; color: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tickFormatter={(v: number) => v.toLocaleString("it-IT")}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideIndicator
                  formatter={(value) => (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {typeof value === "number" ? value.toLocaleString() : String(value)}
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="value" radius={4}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function statusChartData(byStatus: {
  created: number;
  assigned: number;
  onDelivery: number;
  completed: number;
  notDelivered: number;
  cancelled?: number;
}) {
  const data = [
    { label: "Creata", value: byStatus.created, color: STATUS_COLORS.default },
    { label: "Assegnata", value: byStatus.assigned, color: STATUS_COLORS.processing },
    { label: "In consegna", value: byStatus.onDelivery, color: STATUS_COLORS.warning },
    { label: "Completata", value: byStatus.completed, color: STATUS_COLORS.success },
    { label: "Non consegnata", value: byStatus.notDelivered, color: STATUS_COLORS.error },
  ];
  if (byStatus.cancelled !== undefined) {
    data.push({ label: "Cancellata", value: byStatus.cancelled, color: STATUS_COLORS.cancelled });
  }
  return data;
}

function financialChartData(financial: {
  totalRevenue: string;
  completedCompensation?: string;
  totalCompensation: string;
  netProfit: string;
}) {
  return [
    { label: "Ricavi", value: Number(financial.totalRevenue), color: STATUS_COLORS.processing },
    {
      label: "Compensi",
      value: Number(financial.completedCompensation ?? financial.totalCompensation),
      color: STATUS_COLORS.warning,
    },
    { label: "Profitto", value: Number(financial.netProfit), color: STATUS_COLORS.success },
  ];
}

function AdminCharts({ stats }: { stats: AdminStats }) {
  const statusData = statusChartData(stats.deliveries.byStatus);

  const topBusinessesData = stats.topBusinesses.slice(0, 10).map((b, i) => ({
    label: b.name,
    value: b.totalOrders,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }));

  const topRaidersData = stats.topRaiders.slice(0, 10).map((r, i) => ({
    label: r.name,
    value: r.completedDeliveries,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }));

  const financialData = financialChartData(stats.financial);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ColoredBarChart title="Consegne per stato" data={statusData} />
      <ColoredBarChart title="Riepilogo finanziario" data={financialData} />
      <ColoredPieChart title="Top attività per ordini" data={topBusinessesData} />
      <ColoredPieChart title="Top raider per consegne completate" data={topRaidersData} />
    </div>
  );
}

function LogisticsCharts({ stats }: { stats: LogisticsStats }) {
  const statusData = statusChartData(stats.deliveries.byStatus);

  const businessesData = stats.businesses.slice(0, 10).map((b, i) => ({
    label: b.name,
    value: b.totalOrders,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }));

  const raidersData = [...stats.raiders]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 10)
    .map((r, i) => ({
      label: r.raiderName,
      value: r.completed,
      color: PIE_PALETTE[i % PIE_PALETTE.length],
    }));

  const financialData = financialChartData(stats.financial);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ColoredBarChart title="Consegne per stato" data={statusData} />
      <ColoredBarChart title="Riepilogo finanziario" data={financialData} />
      <ColoredPieChart title="Attività gestite per ordini" data={businessesData} />
      <ColoredPieChart title="Top raider per consegne completate" data={raidersData} />
    </div>
  );
}

function BusinessCharts({ stats }: { stats: BusinessStats }) {
  const statusData = statusChartData(stats.orders.byStatus);
  const financialData = financialChartData(stats.financial);

  const raidersData = [...stats.raiders.performance]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 10)
    .map((r, i) => ({
      label: r.raiderName,
      value: r.completed,
      color: PIE_PALETTE[i % PIE_PALETTE.length],
    }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ColoredBarChart title="Ordini per stato" data={statusData} />
      <ColoredBarChart title="Riepilogo finanziario" data={financialData} />
      {raidersData.length > 0 && (
        <ColoredPieChart title="Top raider per consegne completate" data={raidersData} />
      )}
    </div>
  );
}

export default function StatsCharts({
  role,
  stats,
}: {
  role: Role;
  stats: AdminStats | LogisticsStats | BusinessStats;
}) {
  if (role === "ADMIN") return <AdminCharts stats={stats as AdminStats} />;
  if (role === "LOGISTICS") return <LogisticsCharts stats={stats as LogisticsStats} />;
  return <BusinessCharts stats={stats as BusinessStats} />;
}
