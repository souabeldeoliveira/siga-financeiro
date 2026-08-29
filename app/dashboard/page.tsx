import Link from "next/link";

import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Visão geral" title="Dashboard" description="O painel de alertas e indicadores do SIGA será construído nas próximas fases." />
      <Card>
        <p className="text-sm leading-6 text-[var(--muted)]">A estrutura inicial está pronta. A rotina operacional ficará concentrada em Essa Semana.</p>
        <Link href="/essa-semana" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]">Ir para Essa Semana</Link>
      </Card>
    </>
  );
}
