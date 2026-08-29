import Link from "next/link";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { daysUntil } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Dashboard" };
export default async function DashboardPage() {
  await requireAdmin();
  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 86400000);
  const [charges, transfers, expiring] = await Promise.all([
    prisma.charge.count({ where: { status: "OPEN" } }),
    prisma.monthlyObligation.count({ where: { transferStatus: "PENDING" } }),
    prisma.contract.findMany({ where: { status: "ACTIVE", lifecycleStatus: { not: "MOVING_OUT" }, endDate: { gte: now, lte: inThirtyDays } }, include: { property: true }, orderBy: { endDate: "asc" } }),
  ]);
  const isIptuAlert = now.getMonth() === 2 && now.getDate() === 10;
  const cards = [{ label: "Cobranças abertas", count: charges, href: "/cobrancas" }, { label: "Repasses pendentes", count: transfers, href: "/essa-semana" }, { label: "Contratos vencendo", count: expiring.length, href: "/contratos" }];
  return <><PageHeader eyebrow="Visão geral" title="Dashboard" description="Alertas importantes sem executar nenhuma ação financeira." />
    <div className="grid gap-4 sm:grid-cols-3">{cards.map(card => <Link key={card.label} href={card.href}><Card><p className="text-sm text-[var(--muted)]">{card.label}</p><p className="mt-2 text-3xl font-bold">{card.count}</p></Card></Link>)}</div>
    {isIptuAlert && <Card className="mt-5 border-amber-300 bg-amber-50"><p className="font-bold">Mariana, hoje é 10 de março: abrir processo dos IPTUs anuais.</p></Card>}
    <section className="mt-6"><h2 className="mb-3 text-lg font-bold">Vencimentos próximos</h2>{expiring.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhum contrato vence nos próximos 30 dias.</p></Card> : <div className="grid gap-3">{expiring.map(c => <Card key={c.id}><p className="font-bold">{c.property.title}</p><p className="mt-1 text-sm text-[var(--muted)]">Vence em {daysUntil(c.endDate, now)} dia(s).</p></Card>)}</div>}</section>
    <Link href="/essa-semana" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white">Ir para Essa Semana</Link>
  </>;
}
