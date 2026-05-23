"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { loadSessionsPage } from "@/app/actions/sessions";
import { Button } from "@/components/ui/Button";
import { formatSessionDate } from "@/lib/dates";
import { getSessionDisplayTitle } from "@/lib/session";
import type { Session } from "@/lib/types";
import { SessionTitle } from "@/components/sessions/SessionTitle";

export function DashboardSessionsList({
  initialSessions,
  initialHasMore,
  recordNumbers,
}: {
  initialSessions: Session[];
  initialHasMore: boolean;
  recordNumbers: Record<string, number>;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();

  // Sync local state when the server re-renders this page (e.g. after a
  // mutation triggers revalidatePath/router.refresh). Otherwise useState
  // would keep the stale first-page snapshot forever.
  useEffect(() => {
    setSessions(initialSessions);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialSessions, initialHasMore]);

  function loadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const result = await loadSessionsPage(nextPage, false);
      setSessions((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    });
  }

  if (sessions.length === 0) {
    return (
      <p className="text-text-secondary">
        Ainda não há sessões. Cria a primeira acima.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {sessions.map((s) => {
          const { full } = formatSessionDate(s.date);
          return (
            <li key={s.id}>
              <Link
                href={`/admin/sessions/${s.id}/edit`}
                className="flex min-h-[4.5rem] items-stretch justify-between gap-3 rounded-xl border border-white/12 bg-surface px-4 py-4 transition hover:border-gold/35"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <SessionTitle as="p" size="sm" className="flex-1">
                    {getSessionDisplayTitle(s, recordNumbers[s.id] ?? 1)}
                  </SessionTitle>
                  <p className="mt-auto pt-2 text-sm text-text-muted">
                    {full} · {s.type === "torneio" ? "Torneio" : "Livre"}
                  </p>
                </div>
                <span className="shrink-0 self-center text-gold">Editar →</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="mt-4">
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
