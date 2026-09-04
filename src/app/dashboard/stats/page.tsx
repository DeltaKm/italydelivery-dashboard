import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStats } from "@/lib/stats";
import { listBusinesses } from "@/lib/businesses";
import { listRaiders } from "@/lib/raiders";
import { listLogisticsAccounts } from "@/lib/logistics";
import { BackendError } from "@/lib/backend";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
  const logisticsId = typeof searchParams.logisticsId === "string" ? searchParams.logisticsId : undefined;
  const businessId = typeof searchParams.businessId === "string" ? searchParams.businessId : undefined;
  const raiderId = typeof searchParams.raiderId === "string" ? searchParams.raiderId : undefined;

  async function loadFilterOptions() {
    if (session!.role === "ADMIN") {
      const [logisticsRes, businessesRes, raidersRes] = await Promise.all([
        listLogisticsAccounts(session!.token),
        listBusinesses(session!.token, session!.role),
        listRaiders(session!.token, session!.role),
      ]);
      return {
        logistics: logisticsRes.logistics,
        businesses: businessesRes.businesses,
        raiders: raidersRes.raiders,
      };
    }
    if (session!.role === "LOGISTICS") {
      const [businessesRes, raidersRes] = await Promise.all([
        listBusinesses(session!.token, session!.role),
        listRaiders(session!.token, session!.role),
      ]);
      return { businesses: businessesRes.businesses, raiders: raidersRes.raiders };
    }
    if (session!.role === "BUSINESS") {
      const raidersRes = await listRaiders(session!.token, session!.role);
      return { raiders: raidersRes.raiders };
    }
    return null;
  }

  const filterOptionsPromise = loadFilterOptions();

  let stats: Awaited<ReturnType<typeof getStats>> | null = null;
  let statsError: string | null = null;
  try {
    stats = await getStats(session.token, session.role, {
      dateFrom,
      dateTo,
      logisticsId,
      businessId,
      raiderId,
    });
  } catch (error) {
    // Una combinazione di filtri incompatibile (es. attività non gestita
    // dalla logistica selezionata) torna un 400: lo mostriamo come
    // messaggio pulito invece di far esplodere la pagina.
    if (error instanceof BackendError && error.status === 400) {
      statsError = error.message;
    } else {
      throw error;
    }
  }

  const filterOptions = await filterOptionsPromise;

  return (
    <div>
      <PageHeader title="Statistiche" />
      <StatsFilters
        logistics={filterOptions?.logistics}
        businesses={filterOptions?.businesses}
        raiders={filterOptions?.raiders}
      />
      {statsError ? (
        <Alert variant="destructive">
          <AlertTitle>Combinazione di filtri non valida</AlertTitle>
          <AlertDescription>{statsError}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="mb-6">
            <StatsCharts role={session.role} stats={stats!} />
          </div>
          <StatsView role={session.role} stats={stats!} />
        </>
      )}
    </div>
  );
}
