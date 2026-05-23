import type { ReactNode } from "react";

export function PageContainer({
  children,
  narrow = true,
  className = "",
}: {
  children: ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <main
      className={`mx-auto px-4 py-6 sm:px-5 sm:py-8 ${narrow ? "max-w-lg md:max-w-2xl" : "max-w-3xl"} ${className}`}
    >
      {children}
    </main>
  );
}
