import { MapPin } from "lucide-react";
import { formatSessionDate } from "@/lib/dates";
import { getSessionDisplayTitle, isCancelledSession } from "@/lib/session";
import type { Session } from "@/lib/types";
import { SessionTitle } from "@/components/sessions/SessionTitle";
import { SessionTypeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MetaChip } from "@/components/ui/MetaChip";

export function SessionCard({
  session,
  recordNumber,
  attendanceCount = 0,
}: {
  session: Session;
  recordNumber: number;
  attendanceCount?: number;
}) {
  const { day, month } = formatSessionDate(session.date);
  const cancelled = isCancelledSession(session.notes);
  const title = getSessionDisplayTitle(session, recordNumber);

  return (
    <Card href={`/sessions/${session.id}`}>
      <div className="flex gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border ${
            cancelled
              ? "border-white/10 bg-navy-light/50"
              : "border-gold/30 bg-gold/10"
          }`}
        >
          <span className="font-display text-2xl leading-none text-gold">
            {cancelled ? "—" : day}
          </span>
          <span className="mt-0.5 text-xs font-semibold uppercase text-text-muted">
            {cancelled ? "—" : month}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <SessionTitle as="h3" size="md" className="flex-1">
              {title}
            </SessionTitle>
            <SessionTypeBadge type={session.type} />
          </div>

          <div className="mt-2 space-y-2">
            <p className="flex items-start gap-1.5 text-sm text-text-secondary">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-text-muted"
                strokeWidth={2}
                aria-hidden
              />
              <span className="min-w-0 line-clamp-1 [overflow-wrap:anywhere]">
                {session.location}
              </span>
            </p>

            {attendanceCount > 0 && (
              <div className="flex flex-wrap gap-2">
                <MetaChip>{attendanceCount} jogadores</MetaChip>
              </div>
            )}
          </div>
        </div>
      </div>

      {session.notes && (
        <p className="mt-4 rounded-lg border-l-4 border-gold/60 bg-navy-light/80 px-3 py-2.5 text-sm leading-relaxed text-text-secondary line-clamp-2">
          {session.notes}
        </p>
      )}
    </Card>
  );
}
