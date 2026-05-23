import type { MemberWithPresence } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export function MemberCard({ member }: { member: MemberWithPresence }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
          <span className="font-display text-2xl text-gold">
            {member.sessionCount}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-text-primary">{member.name}</p>
          {member.jersey_number != null && (
            <p className="text-sm text-text-muted">
              Camisola #{member.jersey_number}
            </p>
          )}
          <p className="mt-0.5 text-sm text-text-secondary">
            {member.sessionCount === 1
              ? "1 sessão"
              : `${member.sessionCount} sessões`}
          </p>
        </div>
      </div>
    </Card>
  );
}
