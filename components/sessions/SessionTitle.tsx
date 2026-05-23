import type { ElementType } from "react";

type SessionTitleSize = "lg" | "md" | "sm";

const sizeClass: Record<SessionTitleSize, string> = {
  lg: "session-title session-title-lg text-text-primary",
  md: "session-title session-title-md text-text-primary",
  sm: "session-title session-title-sm text-text-primary",
};

export function SessionTitle({
  children,
  as: Tag = "h3",
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  as?: ElementType;
  size?: SessionTitleSize;
  className?: string;
}) {
  return (
    <Tag className={`min-w-0 ${sizeClass[size]} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
