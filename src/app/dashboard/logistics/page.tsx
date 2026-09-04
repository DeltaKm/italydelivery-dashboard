import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listLogisticsAccounts } from "@/lib/logistics";
import { listBusinesses } from "@/lib/businesses";
import PageHeader from "@/components/PageHeader";
import LogisticsView from "./LogisticsView";

export default async function LogisticsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const [{ logistics }, { businesses }] = await Promise.all([
    listLogisticsAccounts(session.token),
    listBusinesses(session.token, session.role),
  ]);

  return (
    <div>
      <PageHeader title="Logistics" />
      <LogisticsView logistics={logistics} businesses={businesses} />
    </div>
  );
}
