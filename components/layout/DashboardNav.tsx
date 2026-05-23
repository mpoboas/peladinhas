"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Users } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { BottomNav } from "@/components/ui/BottomNav";

const tabs = [
  {
    href: "/admin",
    label: "Início",
    icon: Home,
    match: (p: string) => p === "/admin",
  },
  {
    href: "/admin/sessions/new",
    label: "Nova",
    icon: Plus,
    match: (p: string) => p.includes("/sessions/new"),
  },
  {
    href: "/admin/members",
    label: "Membros",
    icon: Users,
    match: (p: string) => p.startsWith("/admin/members"),
  },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  const onEdit = pathname.includes("/sessions/") && pathname.includes("/edit");

  const bottomItems = tabs.map(({ href, label, icon, match }) => ({
    href,
    label,
    icon,
    active: match(pathname),
  }));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold/25 bg-navy/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <div>
            {onEdit ? (
              <Link
                href="/admin"
                className="inline-flex min-h-10 items-center gap-1.5 text-base font-medium text-gold"
              >
                ← Painel
              </Link>
            ) : (
              <>
                <p className="text-xs font-medium uppercase tracking-wider text-gold">
                  Admin
                </p>
                <Link href="/" className="text-sm text-text-muted hover:text-gold">
                  Ver site público
                </Link>
              </>
            )}
          </div>
          <LogoutButton />
        </div>
      </header>

      {!onEdit && (
        <BottomNav items={bottomItems} ariaLabel="Navegação do painel" />
      )}

      {!onEdit && (
        <div className="mx-auto hidden max-w-lg gap-2 px-4 py-2 md:flex">
          {tabs.map(({ href, label, match }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                match(pathname)
                  ? "bg-gold/15 text-gold"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
