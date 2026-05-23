import type { SessionType } from "@/lib/types";

export function SessionTypeBadge({ type }: { type: SessionType }) {
  const isTorneio = type === "torneio";
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-condensed text-[10px] font-bold tracking-widest uppercase ${
        isTorneio
          ? "border-gold/40 bg-gold/15 text-gold"
          : "border-navy-lighter bg-navy-lighter/80 text-sky-300"
      }`}
    >
      {isTorneio ? "Torneio" : "Livre"}
    </span>
  );
}
