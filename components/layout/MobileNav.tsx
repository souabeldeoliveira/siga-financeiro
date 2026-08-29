"use client";

import Link from "next/link";

import { logout } from "@/app/login/actions";

import { NavLinks } from "./NavLinks";

export function MobileNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href="/dashboard" className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-xs font-bold text-white" aria-label="SIGA Financeiro — Dashboard">SF</Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">SIGA Financeiro</p>
          <p className="text-xs text-[var(--muted)]">Gestão imobiliária</p>
        </div>
        <form action={logout}><button type="submit" className="rounded-lg px-3 py-2 text-xs font-semibold text-[var(--muted)]">Sair</button></form>
      </div>
      <nav aria-label="Navegação principal" className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><NavLinks mobile /></nav>
    </header>
  );
}
