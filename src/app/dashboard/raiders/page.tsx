import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listRaiders } from "@/lib/raiders";
import { listBusinesses, canManageBusinesses } from "@/lib/businesses";
import PageHeader from "@/components/PageHeader";
import RaidersView from "./RaidersView";

export default async function RaidersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [{ raiders }, businesses] = await Promise.all([
    listRaiders(session.token, session.role, { status: "all" }),
    canManageBusinesses(session.role)
      ? listBusinesses(session.token, session.role).then((r) => r.businesses)
      : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageHeader title="Raider" />
      <RaidersView raiders={raiders} businesses={businesses} role={session.role} />
    </div>
  );
}
