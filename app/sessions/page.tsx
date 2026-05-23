import { Hero } from "@/components/layout/Hero";
import { PageContainer } from "@/components/layout/PageContainer";
import { PaginatedSessionList } from "@/components/sessions/PaginatedSessionList";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getAttendanceCountsBySession,
  getSessionRecordNumbers,
  getSessionsPaginated,
} from "@/lib/queries";

export default async function SessionsPage() {
  const [initial, recordNumbers] = await Promise.all([
    getSessionsPaginated(1, undefined, { includeCancelled: true }),
    getSessionRecordNumbers(),
  ]);
  const counts = await getAttendanceCountsBySession(
    initial.items.map((s) => s.id),
  );

  return (
    <>
      <Hero compact />
      <PageContainer>
        <PageHeader
          title="Sessões"
          subtitle="Todas as peladinhas, da mais recente à mais antiga."
        />
        <PaginatedSessionList
          initialSessions={initial.items}
          initialHasMore={initial.hasMore}
          recordNumbers={recordNumbers}
          initialCounts={counts}
          includeCancelled
        />
      </PageContainer>
    </>
  );
}
