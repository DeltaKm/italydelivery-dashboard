"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { AdminStats, LogisticsStats, BusinessStats } from "@/lib/types";
import type { Role } from "@/lib/session-constants";

const STATUS_CHART_CONFIG = {
  count: { label: "Consegne", color: "var(--chart-1)" },
} satisfies ChartConfig;

const ORDERS_CHART_CONFIG = {
  orders: { label: "Ordini", color: "var(--chart-1)" },
} satisfies ChartConfig;

function StatusBarChart({
  title,
  data,
  config,
  dataKey,
}: {
  title: string;
  data: Record<string, string | number>[];
  config: ChartConfig;
  dataKey: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-64 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AdminCharts({ stats }: { stats: AdminStats }) {
  const statusData = [
    { label: "Creata", count: stats.deliveries.byStatus.created },
    { label: "Assegnata", count: stats.deliveries.byStatus.assigned },
    { label: "In consegna", count: stats.deliveries.byStatus.onDelivery },
    { label: "Completata", count: stats.deliveries.byStatus.completed },
    { label: "Non consegnata", count: stats.deliveries.byStatus.notDelivered },
  ];

  const topBusinessesData = stats.topBusinesses.slice(0, 10).map((b) => ({
    label: b.name.length > 14 ? `${b.name.slice(0, 14)}…` : b.name,
    orders: b.totalOrders,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StatusBarChart
        title="Consegne per stato"
        data={statusData}
        config={STATUS_CHART_CONFIG}
        dataKey="count"
      />
      <StatusBarChart
        title="Top attività per ordini"
        data={topBusinessesData}
        config={ORDERS_CHART_CONFIG}
        dataKey="orders"
      />
    </div>
  );
}

function LogisticsCharts({ stats }: { stats: LogisticsStats }) {
  const statusData = [
    { label: "Creata", count: stats.deliveries.byStatus.created },
    { label: "Assegnata", count: stats.deliveries.byStatus.assigned },
    { label: "In consegna", count: stats.deliveries.byStatus.onDelivery },
    { label: "Completata", count: stats.deliveries.byStatus.completed },
    { label: "Non consegnata", count: stats.deliveries.byStatus.notDelivered },
  ];

  const businessesData = stats.businesses.slice(0, 10).map((b) => ({
    label: b.name.length > 14 ? `${b.name.slice(0, 14)}…` : b.name,
    orders: b.totalOrders,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StatusBarChart
        title="Consegne per stato"
        data={statusData}
        config={STATUS_CHART_CONFIG}
        dataKey="count"
      />
      <StatusBarChart
        title="Attività gestite per ordini"
        data={businessesData}
        config={ORDERS_CHART_CONFIG}
        dataKey="orders"
      />
    </div>
  );
}

function BusinessCharts({ stats }: { stats: BusinessStats }) {
  const statusData = [
    { label: "Creato", count: stats.orders.byStatus.created },
    { label: "Assegnato", count: stats.orders.byStatus.assigned },
    { label: "In consegna", count: stats.orders.byStatus.onDelivery },
    { label: "Completato", count: stats.orders.byStatus.completed },
    { label: "Non consegnato", count: stats.orders.byStatus.notDelivered },
    { label: "Cancellato", count: stats.orders.byStatus.cancelled },
  ];

  return (
    <StatusBarChart
      title="Ordini per stato"
      data={statusData}
      config={STATUS_CHART_CONFIG}
      dataKey="count"
    />
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
