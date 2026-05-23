import { MembersManager } from "@/components/dashboard/MembersManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMembers } from "@/lib/queries";

export default async function DashboardMembersPage() {
  const members = await getMembers();

  return (
    <div>
      <PageHeader
        title="Membros"
        subtitle="Gere o plantel usado nas presenças e no site público."
      />

      <MembersManager members={members} />
    </div>
  );
}
