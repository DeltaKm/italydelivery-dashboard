import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStats } from "@/lib/stats";
import PageHeader from "@/components/PageHeader";
import StatsView from "../StatsView";
import StatsFilters from "./StatsFilters";

export default async function StatsPage(props: PageProps<"/dashboard/stats">) {
  const session = await getSession();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const dateFrom = typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : undefined;
  const dateTo = typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined;

  const stats = await getStats(session.token, session.role, { dateFrom, dateTo });

  return (
    <div>
      <PageHeader title="Statistiche" />
      <StatsFilters />
      <StatsView role={session.role} stats={stats} />
    </div>
  );
}
