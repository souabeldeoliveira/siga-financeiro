"use client";

import Link from "next/link";

import { logout } from "@/app/login/actions";

import { NavLinks } from "./NavLinks";

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen border-r border-[var(--border)] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="border-b border-[var(--border)] px-6 py-7">
        <Link href="/dashboard" className="inline-flex items-center gap-3" aria-label="SIGA Financeiro — Dashboard">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand)] text-sm font-bold text-white">SF</span>
          <span>
            <span className="block text-base font-bold tracking-tight">SIGA Financeiro</span>
            <span className="block text-xs text-[var(--muted)]">Gestão imobiliária</span>
          </span>
        </Link>
      </div>
      <nav aria-label="Navegação principal" className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"><NavLinks /></nav>
      <div className="border-t border-[var(--border)] px-4 py-4">
        <form action={logout}>
          <button type="submit" className="min-h-10 w-full rounded-xl px-4 text-left text-sm font-semibold text-[var(--muted)] transition hover:bg-slate-50 hover:text-[var(--foreground)]">Sair</button>
        </form>
      </div>
    </aside>
  );
}
