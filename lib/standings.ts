import type { Game, SessionTeam, StandingRow } from "./types";

export function calculateStandings(
  teams: SessionTeam[],
  games: Game[],
): StandingRow[] {
  const rows: Record<string, StandingRow> = {};

  for (const team of teams) {
    rows[team.id] = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };
  }

  for (const game of games) {
    const teamAId =
      typeof game.team_a === "string"
        ? game.team_a
        : (game.expand?.team_a?.id ?? game.team_a);
    const teamBId =
      typeof game.team_b === "string"
        ? game.team_b
        : (game.expand?.team_b?.id ?? game.team_b);

    const a = rows[teamAId];
    const b = rows[teamBId];
    if (!a || !b) continue;

    a.played++;
    b.played++;
    a.goalsFor += game.goals_a;
    a.goalsAgainst += game.goals_b;
    b.goalsFor += game.goals_b;
    b.goalsAgainst += game.goals_a;

    if (game.goals_a > game.goals_b) {
      a.won++;
      a.points += 3;
      b.lost++;
    } else if (game.goals_b > game.goals_a) {
      b.won++;
      b.points += 3;
      a.lost++;
    } else {
      a.drawn++;
      a.points += 1;
      b.drawn++;
      b.points += 1;
    }
  }

  return Object.values(rows).sort(
    (x, y) =>
      y.points - x.points ||
      y.goalsFor - y.goalsAgainst - (x.goalsFor - x.goalsAgainst),
  );
}
