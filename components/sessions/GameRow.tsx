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

export function GameRow({ game, index }: { game: Game; index: number }) {
  const nameA = teamName(game, "a");
  const nameB = teamName(game, "b");
  const isDraw = game.goals_a === game.goals_b;

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.03]">
      <td className="px-2 py-2 text-center text-text-secondary">
        {game.game_order ?? index + 1}
      </td>
      <td className="px-2 py-2 text-left font-condensed font-semibold">
        {nameA}
      </td>
      <td
        className={`px-2 py-2 text-center font-semibold ${isDraw ? "text-text-secondary" : "text-gold-light"}`}
      >
        {game.goals_a} – {game.goals_b}
      </td>
      <td className="px-2 py-2 text-left font-condensed font-semibold">
        {nameB}
      </td>
      {game.notes && (
        <td className="hidden px-2 py-2 text-xs text-text-secondary sm:table-cell">
          {game.notes}
        </td>
      )}
    </tr>
  );
}

export function GameResultInline({ game }: { game: Game }) {
  const nameA = teamName(game, "a");
  const nameB = teamName(game, "b");
  return (
    <span>
      <span className="text-gold">{nameA}</span>
      <span className="mx-2 text-text-secondary">
        {game.goals_a} – {game.goals_b}
      </span>
      <span className="text-gold">{nameB}</span>
    </span>
  );
}
