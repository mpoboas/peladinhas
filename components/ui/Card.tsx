import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`rounded-xl border border-white/12 bg-surface p-4 transition active:scale-[0.99] sm:p-5 ${href ? "hover:border-gold/35 hover:bg-surface-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
  if (href) {
    return (
      <a href={href} className="mb-3 block no-underline">
        {inner}
      </a>
    );
  }
  return inner;
}
