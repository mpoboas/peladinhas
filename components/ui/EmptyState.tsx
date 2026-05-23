export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-navy-light/40 px-4 py-8 text-center">
      <p className="font-medium text-text-primary">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-text-muted">{description}</p>
      )}
    </div>
  );
}
