import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRaider } from "@/lib/raiders";
import { BackendError } from "@/lib/backend";
import PageHeader from "@/components/PageHeader";
import EntityAvatar from "@/components/EntityAvatar";
import RaiderDetailView from "./RaiderDetailView";

export default async function RaiderDetailPage(props: PageProps<"/dashboard/raiders/[id]">) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard/raiders");

  let raider;
  try {
    raider = await getRaider(session.token, id);
  } catch (error) {
    if (error instanceof BackendError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  return (
    <div>
      <PageHeader
        title={`${raider.name} ${raider.surname}`}
        avatar={
          <EntityAvatar
            name={`${raider.name} ${raider.surname}`}
            imgUrl={raider.user?.imgUrl}
            size="lg"
          />
        }
      />
      <RaiderDetailView raider={raider} />
    </div>
  );
}
