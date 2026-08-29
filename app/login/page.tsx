import { redirect } from "next/navigation";

import { Card } from "@/components/cards/Card";
import { getSession } from "@/lib/auth";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-md py-8 sm:py-16">
      <Card>
        <span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">SF</span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Acessar o SIGA</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Entre com a senha local de administração para acessar os dados financeiros.</p>
        <LoginForm />
      </Card>
    </div>
  );
}
