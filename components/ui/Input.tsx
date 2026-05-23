import { type InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`touch-target w-full rounded-lg border border-white/15 bg-navy-light px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 ${className}`}
      {...props}
    />
  );
}
