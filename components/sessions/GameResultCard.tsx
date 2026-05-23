import type { Game } from "@/lib/types";

function teamName(game: Game, side: "a" | "b") {
  const key = side === "a" ? "team_a" : "team_b";
  const expandKey = side === "a" ? "team_a" : "team_b";
  const expanded = game.expand?.[expandKey];
  if (expanded && typeof expanded === "object" && "name" in expanded) {
    return expanded.name;
  }
  return String(game[key]);
}

export function GameResultCard({ game, index }: { game: Game; index: number }) {
  const nameA = teamName(game, "a");
  const nameB = teamName(game, "b");
  const isDraw = game.goals_a === game.goals_b;
  const aWins = game.goals_a > game.goals_b;

  return (
    <div className="rounded-xl border border-white/12 bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-text-muted">
        <span>Jogo {index + 1}</span>
        {game.notes && <span className="text-gold">{game.notes}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 text-right">
          <p
            className={`truncate text-base font-semibold ${aWins ? "text-gold" : "text-text-primary"}`}
          >
            {nameA}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-lg px-4 py-2 font-display text-2xl tracking-wide ${
            isDraw
              ? "bg-navy-light text-text-secondary"
              : "bg-gold/15 text-gold"
          }`}
        >
          {game.goals_a} – {game.goals_b}
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p
            className={`truncate text-base font-semibold ${!isDraw && !aWins ? "text-gold" : "text-text-primary"}`}
          >
            {nameB}
          </p>
        </div>
      </div>
    </div>
  );
}
