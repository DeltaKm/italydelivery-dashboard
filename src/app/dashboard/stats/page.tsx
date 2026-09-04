import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStats } from "@/lib/stats";
import { listBusinesses } from "@/lib/businesses";
import { listRaiders } from "@/lib/raiders";
import PageHeader from "@/components/PageHeader";
import StatsView from "../StatsView";
import StatsFilters from "./StatsFilters";
import StatsCharts from "./StatsCharts";

export default async function StatsPage(props: PageProps<"/dashboard/stats">) {
  const session = await getSession();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const dateFrom = typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : undefined;
  const dateTo = typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined;
  const businessId = typeof searchParams.businessId === "string" ? searchParams.businessId : undefined;
  const raiderId = typeof searchParams.raiderId === "string" ? searchParams.raiderId : undefined;

  const [stats, filterOptions] = await Promise.all([
    getStats(session.token, session.role, { dateFrom, dateTo, businessId, raiderId }),
    session.role === "LOGISTICS"
      ? Promise.all([
          listBusinesses(session.token, session.role).then((r) => r.businesses),
          listRaiders(session.token, session.role).then((r) => r.raiders),
        ]).then(([businesses, raiders]) => ({ businesses, raiders }))
      : Promise.resolve(null),
  ]);

  return (
    <div>
      <PageHeader title="Statistiche" />
      <StatsFilters
        businesses={filterOptions?.businesses}
        raiders={filterOptions?.raiders}
      />
      <div className="mb-6">
        <StatsCharts role={session.role} stats={stats} />
      </div>
      <StatsView role={session.role} stats={stats} />
    </div>
  );
}
