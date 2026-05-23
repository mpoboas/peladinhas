"use client";

import { useEffect, useState, useTransition } from "react";
import { loadSessionsPage } from "@/app/actions/sessions";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Session } from "@/lib/types";

export function PaginatedSessionList({
  initialSessions,
  initialHasMore,
  recordNumbers,
  initialCounts,
  includeCancelled,
}: {
  initialSessions: Session[];
  initialHasMore: boolean;
  recordNumbers: Record<string, number>;
  initialCounts: Record<string, number>;
  includeCancelled: boolean;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [counts, setCounts] = useState(initialCounts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();

  // Sync local state when the server re-renders this page (e.g. after a
  // mutation triggers revalidatePath/router.refresh). Otherwise useState
  // would keep the stale first-page snapshot forever.
  useEffect(() => {
    setSessions(initialSessions);
    setCounts(initialCounts);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialSessions, initialCounts, initialHasMore]);

  function loadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const result = await loadSessionsPage(nextPage, includeCancelled);
      setSessions((prev) => [...prev, ...result.items]);
      setCounts((prev) => ({ ...prev, ...result.counts }));
      setPage(nextPage);
      setHasMore(result.hasMore);
    });
  }

  if (sessions.length === 0) {
    return <EmptyState title="Nenhuma sessão registada" />;
  }

  return (
    <>
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

      {hasMore && (
        <div className="mt-6">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={pending}
            onClick={loadMore}
          >
            {pending ? "A carregar…" : "Carregar mais"}
          </Button>
        </div>
      )}
    </>
  );
}
