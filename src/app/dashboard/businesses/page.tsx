import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listBusinesses } from "@/lib/businesses";
import PageHeader from "@/components/PageHeader";
import BusinessesView from "./BusinessesView";

export default async function BusinessesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "LOGISTICS") redirect("/dashboard");

  const { businesses } = await listBusinesses(session.token, session.role);

  return (
    <div>
      <PageHeader title="Attività" />
      <BusinessesView businesses={businesses} role={session.role} />
    </div>
  );
}
