"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Settings,
  Shirt,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { AttendancePicker } from "@/components/dashboard/AttendancePicker";
import { GameForm } from "@/components/dashboard/GameForm";
import { SessionForm } from "@/components/dashboard/SessionForm";
import { TeamQuickAdd } from "@/components/dashboard/TeamQuickAdd";
import { SessionTitle } from "@/components/sessions/SessionTitle";
import { Button } from "@/components/ui/Button";
import { MetaChip } from "@/components/ui/MetaChip";
import {
  formatCostEUR,
  getCostPerPerson,
  getSessionDisplayTitle,
} from "@/lib/session";
import type {
  Game,
  Member,
  Session,
  SessionAttendance,
  SessionTeam,
} from "@/lib/types";
import { deleteSession } from "@/app/admin/actions";

const TABS = [
  { id: "jogos", label: "Jogos", icon: ClipboardList },
  { id: "presencas", label: "Presenças", icon: UserCheck },
  { id: "equipas", label: "Equipas", icon: Shirt },
  { id: "detalhes", label: "Detalhes", icon: Settings },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

type TabId = (typeof TABS)[number]["id"];

export function SessionEditor({
  session,
  sessionId,
  recordNumber,
  teams,
  attendance,
  games,
  members,
  attendanceCount,
  locations,
}: {
  session: Session;
  sessionId: string;
  recordNumber: number;
  teams: SessionTeam[];
  attendance: SessionAttendance[];
  games: Game[];
  members: Member[];
  attendanceCount: number;
  locations: string[];
}) {
  const [tab, setTab] = useState<TabId>("jogos");
  const perPerson = getCostPerPerson(session.cost, attendanceCount);
  const title = getSessionDisplayTitle(session, recordNumber);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gold/25 bg-gold/5 p-4">
        <SessionTitle as="h1" size="md" className="text-xl">
          {title}
        </SessionTitle>
        <div className="mt-2 flex flex-wrap gap-2">
          <MetaChip variant="gold">
            {session.type === "torneio" ? "Torneio" : "Livre"}
          </MetaChip>
          <MetaChip>{teams.length} equipas</MetaChip>
          <MetaChip>{attendanceCount} presentes</MetaChip>
          <MetaChip>{games.length} jogos</MetaChip>
          {perPerson != null && (
            <MetaChip variant="gold">{formatCostEUR(perPerson)}/pessoa</MetaChip>
          )}
        </div>
        <Link
          href={`/sessions/${sessionId}`}
          className="mt-3 inline-block text-sm font-medium text-gold"
        >
          Ver página pública →
        </Link>
      </div>

      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-navy-light/50 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex min-h-12 shrink-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-xs font-semibold transition sm:flex-row sm:gap-1.5 sm:text-sm ${
                tab === t.id
                  ? "bg-gold text-navy shadow-sm"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span className="leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "jogos" && (
        <div className="space-y-3">
          <GameForm sessionId={sessionId} teams={teams} games={games} />
        </div>
      )}

      {tab === "presencas" && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">
            Toca no nome para marcar presença. Equipa opcional.
          </p>
          <AttendancePicker
            sessionId={sessionId}
            members={members}
            teams={teams}
            attendance={attendance}
          />
        </div>
      )}

      {tab === "equipas" && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">
            Cria as equipas desta peladinha (ex: 021, Terceira Idade).
          </p>
          <TeamQuickAdd sessionId={sessionId} teams={teams} />
        </div>
      )}

      {tab === "detalhes" && (
        <div className="space-y-4">
          <SessionForm session={session} action="edit" locations={locations} />
          <form
            action={deleteSession.bind(null, sessionId)}
            onSubmit={(e) => {
              if (
                !confirm(
                  `Apagar "${title}"? Remove equipas, presenças e jogos associados.`,
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <Button type="submit" variant="danger" size="lg" className="w-full">
              Apagar sessão
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
