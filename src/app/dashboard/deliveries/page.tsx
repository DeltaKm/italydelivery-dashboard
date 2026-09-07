import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listDeliveries } from "@/lib/deliveries";
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

  const { deliveries, pagination } = await listDeliveries(session.token, session.role, {
    limit: PAGE_SIZE,
    offset,
    status,
    dateFrom,
    dateTo,
  });

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
      <DeliveriesFilters />
      <DeliveriesTable
        deliveries={deliveries}
        pagination={pagination}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
