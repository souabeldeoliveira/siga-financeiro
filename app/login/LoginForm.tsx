"use client";

import { useActionState } from "react";

import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-7 space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Senha de acesso</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base outline-none transition focus:border-[var(--brand)]" />
      </div>
      {state?.error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-wait disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
