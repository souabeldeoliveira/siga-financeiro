"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "./navigation";

type NavLinksProps = { mobile?: boolean };

export function NavLinks({ mobile = false }: NavLinksProps) {
  const pathname = usePathname();

  return navigationItems.map((item) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={mobile
          ? `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-[var(--brand)] text-white" : "bg-white text-[var(--foreground)] ring-1 ring-[var(--border)] hover:bg-emerald-50"}`
          : `flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? "bg-emerald-50 text-[var(--brand-dark)]" : "text-[var(--muted)] hover:bg-slate-50 hover:text-[var(--foreground)]"}`}
      >
        {item.label}
      </Link>
    );
  });
}
