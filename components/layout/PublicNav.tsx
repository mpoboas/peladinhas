"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Users } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";

const links = [
  { href: "/", label: "Início", icon: Home },
  { href: "/sessions", label: "Sessões", icon: CalendarDays },
  { href: "/members", label: "Membros", icon: Users },
] as const;

export function PublicNav() {
  const pathname = usePathname();
  const hidden =
    pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (hidden) return null;

  const bottomItems = links.map(({ href, label, icon }) => ({
    href,
    label,
    icon,
    active: href === "/" ? pathname === "/" : pathname.startsWith(href),
  }));

  return (
    <>
      <nav className="relative z-50 hidden border-b border-gold/25 bg-navy/95 backdrop-blur-md md:block">
        <div className="mx-auto flex max-w-3xl justify-center gap-1">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`border-b-2 px-6 py-4 text-sm font-semibold tracking-wide transition ${
                  active
                    ? "border-gold text-gold"
                    : "border-transparent text-text-secondary hover:text-gold"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <BottomNav items={bottomItems} ariaLabel="Navegação principal" />
    </>
  );
}
