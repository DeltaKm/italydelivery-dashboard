import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBusinessProfile, getLogisticsProfile } from "@/lib/profile";
import PageHeader from "@/components/PageHeader";
import BusinessProfileView from "./BusinessProfileView";
import LogisticsProfileView from "./LogisticsProfileView";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "BUSINESS" && session.role !== "LOGISTICS") redirect("/dashboard");

  return (
    <div>
      <PageHeader title="Il mio profilo" />
      {session.role === "BUSINESS" ? (
        <BusinessProfileView profile={await getBusinessProfile(session.token)} />
      ) : (
        <LogisticsProfileView profile={await getLogisticsProfile(session.token)} />
      )}
    </div>
  );
}
