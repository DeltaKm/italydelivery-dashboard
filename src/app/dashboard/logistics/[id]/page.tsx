import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getLogistics } from "@/lib/logistics";
import { BackendError } from "@/lib/backend";
import PageHeader from "@/components/PageHeader";
import EntityAvatar from "@/components/EntityAvatar";
import LogisticsDetailView from "./LogisticsDetailView";

export default async function LogisticsDetailPage(props: PageProps<"/dashboard/logistics/[id]">) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  let logistics;
  try {
    logistics = await getLogistics(session.token, id);
  } catch (error) {
    if (error instanceof BackendError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  return (
    <div>
      <PageHeader
        title={`${logistics.name} ${logistics.surname}`}
        avatar={
          <EntityAvatar
            name={`${logistics.name} ${logistics.surname}`}
            imgUrl={logistics.user?.imgUrl}
            size="lg"
          />
        }
      />
      <LogisticsDetailView logistics={logistics} />
    </div>
  );
}
