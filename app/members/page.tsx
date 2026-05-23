import { Hero } from "@/components/layout/Hero";
import { PageContainer } from "@/components/layout/PageContainer";
import { MemberCard } from "@/components/members/MemberCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMembersWithPresence } from "@/lib/queries";

export default async function MembersPage() {
  const members = await getMembersWithPresence();

  return (
    <>
      <Hero compact />
      <PageContainer>
        <PageHeader
          title="Membros"
          subtitle="Ordenados por quem foi a mais peladinhas."
        />
        {members.length === 0 ? (
          <EmptyState title="Nenhum membro registado" />
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </PageContainer>
    </>
  );
}
