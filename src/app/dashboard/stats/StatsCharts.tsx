"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { AdminStats, LogisticsStats, BusinessStats } from "@/lib/types";
import type { Role } from "@/lib/session-constants";
import { brand } from "@/theme/italydelivery";

// Stessa semantica di StatusBadge.tsx (success/processing/warning/error/default)
const STATUS_COLORS: Record<string, string> = {
  default: "#9ca3af",
  processing: "#3b82f6",
  warning: "#f59e0b",
  success: "#10b981",
  error: "#ef4444",
  cancelled: "#94a3b8",
};

const CHART_CONFIG = {
  value: { label: "Valore" },
} satisfies ChartConfig;

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
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
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

function truncate(name: string) {
  return name.length > 14 ? `${name.slice(0, 14)}…` : name;
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

  const topBusinessesData = stats.topBusinesses.slice(0, 10).map((b) => ({
    label: truncate(b.name),
    value: b.totalOrders,
    color: brand.primary,
  }));

  const topRaidersData = stats.topRaiders.slice(0, 10).map((r) => ({
    label: truncate(r.name),
    value: r.completedDeliveries,
    color: brand.primary,
  }));

  const financialData = financialChartData(stats.financial);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ColoredBarChart title="Consegne per stato" data={statusData} />
      <ColoredBarChart title="Riepilogo finanziario" data={financialData} />
      <ColoredBarChart title="Top attività per ordini" data={topBusinessesData} />
      <ColoredBarChart title="Top raider per consegne completate" data={topRaidersData} />
    </div>
  );
}

function LogisticsCharts({ stats }: { stats: LogisticsStats }) {
  const statusData = statusChartData(stats.deliveries.byStatus);

  const businessesData = stats.businesses.slice(0, 10).map((b) => ({
    label: truncate(b.name),
    value: b.totalOrders,
    color: brand.primary,
  }));

  const raidersData = [...stats.raiders]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 10)
    .map((r) => ({
      label: truncate(r.raiderName),
      value: r.completed,
      color: brand.primary,
    }));

  const financialData = financialChartData(stats.financial);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ColoredBarChart title="Consegne per stato" data={statusData} />
      <ColoredBarChart title="Riepilogo finanziario" data={financialData} />
      <ColoredBarChart title="Attività gestite per ordini" data={businessesData} />
      <ColoredBarChart title="Top raider per consegne completate" data={raidersData} />
    </div>
  );
}

function BusinessCharts({ stats }: { stats: BusinessStats }) {
  const statusData = statusChartData(stats.orders.byStatus);
  const financialData = financialChartData(stats.financial);

  const raidersData = [...stats.raiders.performance]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 10)
    .map((r) => ({
      label: truncate(r.raiderName),
      value: r.completed,
      color: brand.primary,
    }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ColoredBarChart title="Ordini per stato" data={statusData} />
      <ColoredBarChart title="Riepilogo finanziario" data={financialData} />
      {raidersData.length > 0 && (
        <ColoredBarChart title="Top raider per consegne completate" data={raidersData} />
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
