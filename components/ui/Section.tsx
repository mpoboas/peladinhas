import type { ReactNode } from "react";

export function Section({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-white/10 bg-surface p-4 sm:p-5 ${className}`}>
      <div className="mb-4 border-b border-white/10 pb-3">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
