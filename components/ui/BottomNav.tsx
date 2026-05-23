"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

export function BottomNav({ items, ariaLabel }: { items: BottomNavItem[]; ariaLabel: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-navy shadow-[0_-8px_32px_rgba(0,0,0,0.45)] md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label={ariaLabel}
    >
      <div className="mx-auto flex h-[var(--nav-height)] max-w-lg items-stretch px-1">
        {items.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide transition ${
              active ? "text-gold" : "text-text-muted"
            }`}
          >
            <Icon
              className="h-[22px] w-[22px] shrink-0"
              strokeWidth={active ? 2.5 : 2}
              aria-hidden
            />
            <span className="leading-none">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
