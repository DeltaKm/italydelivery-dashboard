import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBusiness } from "@/lib/businesses";
import { listRaiders } from "@/lib/raiders";
import { listLogisticsAccounts } from "@/lib/logistics";
import { BackendError } from "@/lib/backend";
import PageHeader from "@/components/PageHeader";
import EntityAvatar from "@/components/EntityAvatar";
import BusinessDetailView from "./BusinessDetailView";

export default async function BusinessDetailPage(
  props: PageProps<"/dashboard/businesses/[id]">
) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN" && session.role !== "LOGISTICS") redirect("/dashboard");

  let business;
  try {
    business = await getBusiness(session.token, session.role, id);
  } catch (error) {
    if (error instanceof BackendError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  let allRaiders: { id: string; name: string; surname: string }[] = [];
  let allLogistics: { id: string; name: string; surname: string }[] = [];
  if (session.role === "ADMIN") {
    const [raidersRes, logisticsRes] = await Promise.all([
      listRaiders(session.token, session.role),
      listLogisticsAccounts(session.token),
    ]);
    allRaiders = raidersRes.raiders;
    allLogistics = logisticsRes.logistics;
  }

  return (
    <div>
      <PageHeader
        title={business.bussinesName}
        avatar={
          <EntityAvatar name={business.bussinesName} imgUrl={business.user?.imgUrl} size="lg" />
        }
      />
      <BusinessDetailView
        business={business}
        role={session.role}
        allRaiders={allRaiders}
        allLogistics={allLogistics}
      />
    </div>
  );
}
