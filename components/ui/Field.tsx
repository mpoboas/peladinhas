import type { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-medium text-text-primary">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-text-muted">{hint}</p>}
    </div>
  );
}
