import { redirect } from "next/navigation";

import { Card } from "@/components/cards/Card";
import { InstallAppPrompt } from "@/components/pwa/InstallAppPrompt";
import { getSession } from "@/lib/auth";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-md py-8 sm:py-16">
      <Card>
        <span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand)] text-base font-black text-white shadow-[0_8px_18px_rgba(139,49,86,0.22)]">C</span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Cazabela</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Gestão Financeira</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Entre com a senha local para acessar sua rotina financeira.</p>
        <LoginForm />
        <InstallAppPrompt />
      </Card>
    </div>
  );
}
