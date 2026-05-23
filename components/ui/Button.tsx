import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-navy font-semibold hover:bg-gold-light border border-gold-dark shadow-sm",
  secondary:
    "bg-navy-light text-text-primary border border-white/15 hover:border-gold/40",
  ghost: "text-text-secondary hover:bg-surface hover:text-gold border border-transparent",
  danger:
    "bg-red-950/60 text-red-200 border border-red-500/40 hover:bg-red-900/70",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 py-2.5 text-base",
  lg: "min-h-14 px-6 py-3 text-base font-semibold w-full sm:w-auto",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg transition disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
