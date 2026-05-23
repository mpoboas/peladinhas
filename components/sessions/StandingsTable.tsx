import type { StandingRow } from "@/lib/types";

const statCols = ["J", "V", "E", "D", "G", "PTS"] as const;

export function StandingsTable({ rows }: { rows: StandingRow[] }) {
  if (rows.length === 0) return null;

  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr className="border-b border-white/15">
          <th className="w-[38%] py-2 pr-1 text-left text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Equipa
          </th>
          {statCols.map((h) => (
            <th
              key={h}
              className="w-[9%] py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.team.id}
            className={`border-b border-white/8 ${
              i === 0 ? "bg-gold/5" : i % 2 === 1 ? "bg-white/[0.02]" : ""
            }`}
          >
            <td className="truncate py-2 pr-1 font-semibold">{row.team.name}</td>
            <td className="py-2 text-center tabular-nums">{row.played}</td>
            <td className="py-2 text-center tabular-nums text-gold-light">
              {row.won}
            </td>
            <td className="py-2 text-center tabular-nums">{row.drawn}</td>
            <td className="py-2 text-center tabular-nums">{row.lost}</td>
            <td
              className="py-2 text-center text-xs tabular-nums text-text-secondary"
              title={`${row.goalsFor}:${row.goalsAgainst}`}
            >
              {row.goalsFor}:{row.goalsAgainst}
            </td>
            <td className="py-2 text-center font-bold tabular-nums text-gold">
              {row.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
