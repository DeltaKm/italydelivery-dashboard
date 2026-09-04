import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStats } from "@/lib/stats";
import PageHeader from "@/components/PageHeader";
import StatsView from "./StatsView";

export default async function DashboardHomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const stats = await getStats(session.token, session.role);

  return (
    <div>
      <PageHeader title="Panoramica" />
      <StatsView role={session.role} stats={stats} />
    </div>
  );
}
