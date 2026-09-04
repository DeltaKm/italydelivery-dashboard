import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listUsers } from "@/lib/users";
import PageHeader from "@/components/PageHeader";
import UsersView from "./UsersView";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const { users } = await listUsers(session.token);

  return (
    <div>
      <PageHeader title="Utenti" />
      <UsersView users={users} />
    </div>
  );
}
