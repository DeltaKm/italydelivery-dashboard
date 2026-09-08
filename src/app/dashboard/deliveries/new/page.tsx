import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canCreateDelivery } from "@/lib/delivery-rules";
import { listBusinesses } from "@/lib/businesses";
import PageHeader from "@/components/PageHeader";
import DeliveryForm from "./DeliveryForm";

export default async function NewDeliveryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canCreateDelivery(session.role)) redirect("/dashboard/deliveries");

  const businesses =
    session.role === "LOGISTICS" || session.role === "ADMIN"
      ? (await listBusinesses(session.token, session.role)).businesses
      : [];

  return (
    <div>
      <PageHeader title="Nuova consegna" />
      <DeliveryForm role={session.role} businesses={businesses} />
    </div>
  );
}
