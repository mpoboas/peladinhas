import { formatSessionDate } from "@/lib/dates";
import type { HomeStats } from "@/lib/types";

export function StatsBar({ stats }: { stats: HomeStats }) {
  const lastLabel = stats.lastSession
    ? formatSessionDate(stats.lastSession.date).month
    : "—";

  const items = [
    { num: stats.totalSessions, label: "Sessões" },
    { num: stats.totalTournaments, label: "Torneios" },
    { num: stats.totalMembers, label: "Membros" },
    { num: lastLabel, label: "Última" },
  ];

  return (
    <div className="relative z-10 grid grid-cols-4 border-b border-gold/25">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`px-1.5 py-3 text-center sm:px-3 sm:py-4 ${
            i < items.length - 1 ? "border-r border-white/10" : ""
          }`}
        >
          <div className="font-display text-2xl leading-none text-gold sm:text-4xl">
            {item.num}
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-text-muted sm:mt-1.5 sm:text-xs">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
