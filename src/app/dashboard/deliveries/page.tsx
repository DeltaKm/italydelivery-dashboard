import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listDeliveries } from "@/lib/deliveries";
import { listBusinesses } from "@/lib/businesses";
import { listRaiders } from "@/lib/raiders";
import { canCreateDelivery } from "@/lib/delivery-rules";
import PageHeader from "@/components/PageHeader";
import DeliveriesTable from "./DeliveriesTable";
import DeliveriesFilters from "./DeliveriesFilters";
import NewDeliveryButton from "./NewDeliveryButton";
import DeliveriesExportButton from "./DeliveriesExportButton";

const PAGE_SIZE = 20;

export default async function DeliveriesPage(
  props: PageProps<"/dashboard/deliveries">
) {
  const session = await getSession();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const dateFrom = typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : undefined;
  const dateTo = typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined;
  const businessId = typeof searchParams.businessId === "string" ? searchParams.businessId : undefined;
  const raiderId = typeof searchParams.raiderId === "string" ? searchParams.raiderId : undefined;

  async function loadFilterOptions() {
    // Business vede già solo le proprie consegne: non serve un filtro attività.
    if (session!.role === "BUSINESS") {
      const raidersRes = await listRaiders(session!.token, session!.role);
      return { raiders: raidersRes.raiders };
    }
    const [businessesRes, raidersRes] = await Promise.all([
      listBusinesses(session!.token, session!.role),
      listRaiders(session!.token, session!.role),
    ]);
    return { businesses: businessesRes.businesses, raiders: raidersRes.raiders };
  }

  const [{ deliveries, pagination }, filterOptions] = await Promise.all([
    listDeliveries(session.token, session.role, {
      limit: PAGE_SIZE,
      offset,
      status,
      dateFrom,
      dateTo,
      businessId,
      raiderId,
    }),
    loadFilterOptions(),
  ]);

  return (
    <div>
      <PageHeader
        title="Consegne"
        actions={
          <div className="flex items-center gap-2">
            <DeliveriesExportButton />
            {canCreateDelivery(session.role) && <NewDeliveryButton />}
          </div>
        }
      />
      <DeliveriesFilters businesses={filterOptions.businesses} raiders={filterOptions.raiders} />
      <DeliveriesTable
        deliveries={deliveries}
        pagination={pagination}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
