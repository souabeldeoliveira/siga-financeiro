"use client";

import Link from "next/link";

import { logout } from "@/app/login/actions";

import { NavLinks } from "./NavLinks";

export function MobileNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href="/dashboard" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-sm font-black text-white shadow-[0_6px_14px_rgba(139,49,86,0.2)]" aria-label="Cazabela — Gestão Financeira — Dashboard">C</Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">Cazabela</p>
          <p className="text-xs text-[var(--muted)]">Gestão Financeira</p>
        </div>
        <form action={logout}><button type="submit" className="rounded-xl px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)]">Sair</button></form>
      </div>
      <nav aria-label="Navegação principal" className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><NavLinks mobile /></nav>
    </header>
  );
}
