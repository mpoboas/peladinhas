import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`touch-target w-full rounded-lg border border-white/15 bg-navy-light px-4 py-2.5 text-base text-text-primary focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
