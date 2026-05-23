"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { QuickMemberModal } from "@/components/dashboard/QuickMemberModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  addAttendance,
  removeAttendance,
  updateAttendance,
} from "@/app/admin/actions";
import { useRefreshTransition } from "@/lib/use-refresh-transition";
import type { Member, SessionAttendance, SessionTeam } from "@/lib/types";

function MemberSearchBar({
  filter,
  onFilterChange,
  onNewMember,
  pending,
}: {
  filter: string;
  onFilterChange: (value: string) => void;
  onNewMember: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="search"
        placeholder="Procurar jogador…"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="touch-target min-w-0 flex-1 rounded-lg border border-white/15 bg-navy-light px-4 text-base text-text-primary placeholder:text-text-muted focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={onNewMember}
        className="shrink-0 gap-1.5 px-3"
        aria-label="Criar novo membro"
      >
        <UserPlus className="h-5 w-5" aria-hidden />
        <span className="hidden sm:inline">Novo</span>
      </Button>
    </div>
  );
}

// ─── Attendee chip ────────────────────────────────────────────────────────────

function AttendeeChip({
  a,
  sessionId,
  teams,
  pending,
  refresh,
}: {
  a: SessionAttendance;
  sessionId: string;
  teams: SessionTeam[];
  pending: boolean;
  refresh: (action: () => void | Promise<void>) => void;
}) {
  const [showMove, setShowMove] = useState(false);
  const name = a.expand?.member?.name ?? "—";

  return (
    <div className="group flex min-h-10 items-center gap-1 rounded-lg border border-white/12 bg-surface pl-3 pr-1 py-1">
      <span className="flex-1 text-sm font-medium text-text-primary leading-tight">
        {name}
      </span>

      {teams.length > 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={() => setShowMove((v) => !v)}
          className="rounded px-1.5 py-0.5 text-xs text-text-muted transition hover:text-gold"
          aria-label="Mover de equipa"
        >
          ⇄
        </button>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={() => refresh(() => removeAttendance(a.id, sessionId))}
        className="flex h-7 w-7 items-center justify-center rounded text-text-muted transition hover:text-red-400"
        aria-label="Remover"
      >
        ×
      </button>

      {showMove && teams.length > 0 && (
        <div className="absolute z-10 mt-1 flex flex-wrap gap-1 rounded-lg border border-white/15 bg-navy-light p-2 shadow-xl">
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={pending}
              onClick={() => {
                refresh(() => updateAttendance(a.id, sessionId, t.id));
                setShowMove(false);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                a.team === t.id
                  ? "bg-gold text-navy"
                  : "border border-white/20 text-text-secondary hover:border-gold/40 hover:text-gold"
              }`}
            >
              {t.name}
            </button>
          ))}
          {a.team && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                refresh(() => updateAttendance(a.id, sessionId, null));
                setShowMove(false);
              }}
              className="rounded-full border border-white/20 px-3 py-1 text-xs text-text-muted hover:border-red-400/40 hover:text-red-400 transition"
            >
              Sem equipa
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AttendancePicker({
  sessionId,
  members,
  teams,
  attendance,
}: {
  sessionId: string;
  members: Member[];
  teams: SessionTeam[];
  attendance: SessionAttendance[];
}) {
  const { pending, refresh } = useRefreshTransition();
  const [filter, setFilter] = useState("");
  const [showQuickMember, setShowQuickMember] = useState(false);

  // Active team tab: team id, or "" for "no team", or null = unset (first team)
  const [activeTeamId, setActiveTeamId] = useState<string | null>(
    teams.length > 0 ? teams[0].id : null,
  );

  const presentIds = new Set(attendance.map((a) => a.member));

  const available = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return members
      .filter((m) => !presentIds.has(m.id))
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          String(m.jersey_number ?? "").includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }, [members, presentIds, filter]);

  // Group attendance by team id (null = no team)
  const byTeam = useMemo(() => {
    const map = new Map<string | null, SessionAttendance[]>();
    map.set(null, []);
    teams.forEach((t) => map.set(t.id, []));
    attendance.forEach((a) => {
      const key = a.team || null;
      const bucket = map.get(key) ?? map.get(null)!;
      bucket.push(a);
    });
    return map;
  }, [attendance, teams]);

  function addMember(memberId: string) {
    refresh(() =>
      addAttendance(sessionId, memberId, activeTeamId ?? undefined),
    );
  }

  const activeTeamName =
    activeTeamId === null
      ? "sem equipa"
      : (teams.find((t) => t.id === activeTeamId)?.name ?? "—");

  const quickMemberModal = (
    <QuickMemberModal
      open={showQuickMember}
      sessionId={sessionId}
      teamId={teams.length > 0 ? activeTeamId : null}
      teamName={teams.length > 0 && activeTeamId ? activeTeamName : undefined}
      onClose={() => setShowQuickMember(false)}
    />
  );

  // ── No teams: simple flow ───────────────────────────────────────────────────
  if (teams.length === 0) {
    return (
      <div className="space-y-4">
        <MemberSearchBar
          filter={filter}
          onFilterChange={setFilter}
          onNewMember={() => setShowQuickMember(true)}
          pending={pending}
        />
        {quickMemberModal}

        {available.length === 0 ? (
          <EmptyState
            title={filter ? "Ninguém com esse nome" : "Todos marcados"}
            description={
              filter
                ? "Tenta outro termo de pesquisa."
                : "Todos os membros já têm presença nesta sessão."
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {available.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={pending}
                onClick={() => addMember(m.id)}
                className="min-h-14 rounded-xl border border-white/15 bg-navy-light px-3 py-2.5 text-left text-base font-medium text-text-primary transition hover:border-gold/40 hover:bg-gold/10 active:scale-[0.98] disabled:opacity-50"
              >
                {m.name}
                {m.jersey_number != null && (
                  <span className="mt-0.5 block text-sm text-text-muted">
                    #{m.jersey_number}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {attendance.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-secondary">
              Presentes ({attendance.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {attendance.map((a) => (
                <AttendeeChip
                  key={a.id}
                  a={a}
                  sessionId={sessionId}
                  teams={[]}
                  pending={pending}
                  refresh={refresh}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── With teams: tabbed flow ─────────────────────────────────────────────────
  const noTeamCount = byTeam.get(null)?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Team tabs */}
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-navy-light/50 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {teams.map((t) => {
          const count = byTeam.get(t.id)?.length ?? 0;
          const isActive = activeTeamId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTeamId(t.id)}
              className={`relative shrink-0 flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-gold text-navy shadow-sm"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              {t.name}
              {count > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    isActive ? "bg-navy/30 text-navy" : "bg-white/15 text-text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
        {/* "No team" tab */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTeamId === null}
          onClick={() => setActiveTeamId(null)}
          className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTeamId === null
              ? "bg-surface text-text-primary ring-1 ring-white/20"
              : "text-text-muted hover:bg-surface"
          }`}
        >
          —
          {noTeamCount > 0 && (
            <span className="ml-1.5 rounded-full bg-white/15 px-1.5 py-0.5 text-xs font-bold text-text-muted">
              {noTeamCount}
            </span>
          )}
        </button>
      </div>

      <MemberSearchBar
        filter={filter}
        onFilterChange={setFilter}
        onNewMember={() => setShowQuickMember(true)}
        pending={pending}
      />
      {quickMemberModal}

      {/* Available players */}
      {available.length === 0 ? (
        <EmptyState
          title={filter ? "Ninguém com esse nome" : "Todos marcados"}
          description={
            filter
              ? "Tenta outro termo de pesquisa."
              : "Todos os membros já têm presença nesta sessão."
          }
        />
      ) : (
        <div>
          <p className="mb-2 text-xs text-text-muted">
            Toca para adicionar à equipa{" "}
            <span className="font-semibold text-text-secondary">
              {activeTeamName}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {available.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={pending}
                onClick={() => addMember(m.id)}
                className="min-h-14 rounded-xl border border-white/15 bg-navy-light px-3 py-2.5 text-left text-base font-medium text-text-primary transition hover:border-gold/40 hover:bg-gold/10 active:scale-[0.98] disabled:opacity-50"
              >
                {m.name}
                {m.jersey_number != null && (
                  <span className="mt-0.5 block text-sm text-text-muted">
                    #{m.jersey_number}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Presentes grouped by team */}
      {attendance.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary">
            Presentes ({attendance.length})
          </h3>

          {teams.map((t) => {
            const members = byTeam.get(t.id) ?? [];
            if (members.length === 0) return null;
            return (
              <div key={t.id}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t.name}
                </p>
                <div className="relative flex flex-wrap gap-2">
                  {members.map((a) => (
                    <AttendeeChip
                      key={a.id}
                      a={a}
                      sessionId={sessionId}
                      teams={teams}
                      pending={pending}
                      refresh={refresh}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {noTeamCount > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Sem equipa
              </p>
              <div className="relative flex flex-wrap gap-2">
                {(byTeam.get(null) ?? []).map((a) => (
                  <AttendeeChip
                    key={a.id}
                    a={a}
                    sessionId={sessionId}
                    teams={teams}
                    pending={pending}
                    refresh={refresh}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
