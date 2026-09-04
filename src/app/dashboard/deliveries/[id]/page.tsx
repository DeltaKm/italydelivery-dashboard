import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDelivery } from "@/lib/deliveries";
import { listRaiders } from "@/lib/raiders";
import { BackendError } from "@/lib/backend";
import PageHeader from "@/components/PageHeader";
import DeliveryDetail from "./DeliveryDetail";

export default async function DeliveryDetailPage(props: PageProps<"/dashboard/deliveries/[id]">) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect("/login");

  let delivery;
  try {
    delivery = await getDelivery(session.token, session.role, id);
  } catch (error) {
    if (error instanceof BackendError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  const { raiders } = await listRaiders(session.token, session.role, { status: "confirmed" });

  return (
    <div>
      <PageHeader title={`Consegna ${delivery.orderId ?? delivery.id}`} />
      <DeliveryDetail delivery={delivery} raiders={raiders} role={session.role} />
    </div>
  );
}
