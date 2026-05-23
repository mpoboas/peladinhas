import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { PageContainer } from "@/components/layout/PageContainer";
import { GameResultCard } from "@/components/sessions/GameResultCard";
import { SessionShareButton } from "@/components/sessions/SessionShareButton";
import { SessionTitle } from "@/components/sessions/SessionTitle";
import { StandingsTable } from "@/components/sessions/StandingsTable";
import { SessionTypeBadge } from "@/components/ui/Badge";
import { MetaChip } from "@/components/ui/MetaChip";
import { Section } from "@/components/ui/Section";
import { formatSessionDate } from "@/lib/dates";
import { getSessionRecordNumbers, getSessionWithDetails } from "@/lib/queries";
import { getSessionDisplayTitle, isCancelledSession } from "@/lib/session";
import { sortGames } from "@/lib/games";
import { calculateStandings } from "@/lib/standings";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, recordNumbers, isAdmin] = await Promise.all([
    getSessionWithDetails(id),
    getSessionRecordNumbers(),
    isAuthenticated(),
  ]);
  if (!data) notFound();

  const { session, teams, attendance, games, attendanceCount } = data;
  const recordNumber = recordNumbers[id] ?? 1;
  const { full } = formatSessionDate(session.date);
  const standings =
    session.type === "torneio" ? calculateStandings(teams, games) : [];

  const rosterByTeam = new Map<string, string[]>();
  for (const row of attendance) {
    const memberName = row.expand?.member?.name ?? "—";
    const teamName = row.expand?.team?.name;
    if (teamName) {
      if (!rosterByTeam.has(teamName)) rosterByTeam.set(teamName, []);
      rosterByTeam.get(teamName)!.push(memberName);
    }
  }

  const title = getSessionDisplayTitle(session, recordNumber);

  const sortedGames = sortGames(games);

  function gameTeamName(
    game: (typeof games)[number],
    side: "a" | "b",
  ): string {
    const expandKey = side === "a" ? "team_a" : "team_b";
    const expanded = game.expand?.[expandKey];
    if (expanded && typeof expanded === "object" && "name" in expanded) {
      return expanded.name;
    }
    return String(game[side === "a" ? "team_a" : "team_b"]);
  }

  const storyData = {
    title,
    location: session.location,
    date: full,
    type: session.type,
    attendanceCount,
    gamesCount: games.length,
    standings: standings.map((row) => ({
      teamName: row.team.name,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      points: row.points,
    })),
    games: sortedGames.map((g, i) => ({
      order: i + 1,
      teamA: gameTeamName(g, "a"),
      teamB: gameTeamName(g, "b"),
      goalsA: g.goals_a,
      goalsB: g.goals_b,
    })),
  };

  return (
    <PageContainer>
      <Link
        href="/sessions"
        className="mb-4 inline-flex min-h-10 items-center text-base font-medium text-gold"
      >
        ← Voltar às sessões
      </Link>

      <header className="mb-6 flex min-h-[11rem] flex-col rounded-xl border border-white/12 bg-surface p-5 sm:min-h-[10rem]">
        <div className="flex items-center justify-between gap-3">
          <SessionTypeBadge type={session.type} />
          {isAdmin && (
            <Link
              href={`/admin/sessions/${id}/edit`}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/20"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Editar
            </Link>
          )}
        </div>

        <SessionTitle as="h1" size="lg" className="mt-3">
          {title}
        </SessionTitle>

        <div className="mt-auto space-y-3 pt-4">
          <p className="flex items-start gap-2 text-base text-text-secondary">
            <MapPin
              className="mt-1 h-5 w-5 shrink-0 text-text-muted"
              strokeWidth={2}
              aria-hidden
            />
            <span className="min-w-0 line-clamp-2 [overflow-wrap:anywhere]">
              {session.location}
            </span>
          </p>
          <p className="text-base text-text-muted">{full}</p>

          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {attendanceCount > 0 && (
                <MetaChip>{attendanceCount} jogadores</MetaChip>
              )}
              {games.length > 0 && (
                <MetaChip>{games.length} jogos</MetaChip>
              )}
            </div>
            <SessionShareButton data={storyData} className="shrink-0" />
          </div>
        </div>
      </header>

      {session.notes && (
        <p className="mb-6 rounded-xl border-l-4 border-gold/60 bg-navy-light/80 px-4 py-3 text-base leading-relaxed text-text-secondary">
          {session.notes}
        </p>
      )}

      {session.type === "torneio" && standings.length > 0 && (
        <Section title="Classificação" className="mb-6">
          <StandingsTable rows={standings} />
        </Section>
      )}

      {games.length > 0 && (
        <Section title="Resultados" description="Jogo a jogo" className="mb-6">
          <div className="space-y-3">
            {sortedGames.map((g, i) => (
              <GameResultCard key={g.id} game={g} index={i} />
            ))}
          </div>
        </Section>
      )}

      {rosterByTeam.size > 0 && (
        <Section title="Quem foi" className="mb-6">
          <div className="space-y-4">
            {[...rosterByTeam.entries()].map(([teamName, players]) => (
              <div key={teamName}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold">
                  {teamName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {players.map((p) => (
                    <MetaChip key={p}>{p}</MetaChip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {games.length === 0 &&
        session.type === "livre" &&
        !isCancelledSession(session.notes) && (
          <p className="text-base text-text-muted">
            Sessão livre — sem resultados registados.
          </p>
        )}
    </PageContainer>
  );
}
