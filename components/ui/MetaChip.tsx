import type { ReactNode } from "react";

export function MetaChip({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "gold" | "muted";
}) {
  const styles = {
    default: "border-white/15 bg-surface text-text-secondary",
    gold: "border-gold/35 bg-gold/10 text-gold-light",
    muted: "border-white/10 bg-transparent text-text-muted",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
