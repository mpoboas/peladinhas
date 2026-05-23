"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const hidden =
    pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (hidden) return null;

  return (
    <footer className="mt-auto border-t border-gold/25 bg-navy py-8 text-center text-sm text-text-secondary">
      <strong className="text-text-primary">Peladinhas da Invicta</strong>
      <span className="mx-2">·</span>
      Porto · ISEP
      <span className="mt-2 block italic">
        &quot;Só mais 4 crlhs&quot; — TT, sempre
      </span>
    </footer>
  );
}
