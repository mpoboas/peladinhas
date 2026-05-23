import type { ReactNode } from "react";

export function SectionTitle({
  children,
  highlight,
}: {
  children: ReactNode;
  highlight?: string;
}) {
  return (
    <h2 className="font-display text-3xl tracking-wide text-text-primary">
      {children}
      {highlight && <span className="text-gold"> {highlight}</span>}
    </h2>
  );
}
