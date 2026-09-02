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
        prefetch={true}
        aria-current={isActive ? "page" : undefined}
        className={mobile
          ? `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-[var(--brand)] text-white shadow-[0_5px_12px_rgba(91,52,38,0.18)]" : "bg-[var(--surface)] text-[var(--foreground)] ring-1 ring-[var(--border)] hover:bg-[var(--surface-soft)]"}`
          : `flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? "bg-[#f1dfd2] text-[var(--brand-dark)]" : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"}`}
      >
        {item.label}
      </Link>
    );
  });
}
