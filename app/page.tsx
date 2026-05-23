import Link from "next/link";
import { Hero } from "@/components/layout/Hero";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatsBar } from "@/components/layout/StatsBar";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getAttendanceCountsBySession,
  getHomeStats,
  getSessionRecordNumbers,
  getSessions,
} from "@/lib/queries";

export default async function HomePage() {
  const [stats, sessions, recordNumbers] = await Promise.all([
    getHomeStats(),
    getSessions(5),
    getSessionRecordNumbers(),
  ]);
  const counts = await getAttendanceCountsBySession(
    sessions.map((s) => s.id),
  );

  return (
    <>
      <Hero />
      <StatsBar stats={stats} />
      <PageContainer>
        <PageHeader
          title="Últimas peladinhas"
          subtitle="Resultados e histórico do grupo."
        />
        {sessions.length === 0 ? (
          <EmptyState
            title="Sem sessões ainda"
            description="Quando forem registadas, aparecem aqui."
          />
        ) : (
          <div className="space-y-0">
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                recordNumber={recordNumbers[s.id] ?? 1}
                attendanceCount={counts[s.id] ?? 0}
              />
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link href="/sessions">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Ver todas as sessões
            </Button>
          </Link>
        </div>
      </PageContainer>
    </>
  );
}
