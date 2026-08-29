import Link from "next/link";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/auth";
import { daysUntil } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { markMovingOut, renewContract } from "@/app/contratos/lifecycle-actions";
import { StatusMessage } from "@/components/layout/StatusMessage";

export const metadata = { title: "Dashboard" };
type Props={searchParams:Promise<{erro?:string;sucesso?:string}>};
export default async function DashboardPage({searchParams}:Props) {
  await requireAdmin();
  const now = new Date();
  const inThirtyDays = new Date(now.getTime() + 30 * 86400000);
  const [charges, transfers, expiring,params] = await Promise.all([
    prisma.charge.count({ where: { status: "OPEN" } }),
    prisma.monthlyObligation.count({ where: { transferStatus: "PENDING" } }),
    prisma.contract.findMany({ where: { status: "ACTIVE", lifecycleStatus: { not: "MOVING_OUT" }, endDate: { gte: now, lte: inThirtyDays } }, include: { property: true }, orderBy: { endDate: "asc" } }),searchParams
  ]);
  const isIptuAlert = now.getMonth() === 2 && now.getDate() === 10;
  const cards = [{ label: "Cobranças abertas", count: charges, href: "/cobrancas" }, { label: "Repasses pendentes", count: transfers, href: "/essa-semana" }, { label: "Contratos vencendo", count: expiring.length, href: "/contratos" }];
  return <><PageHeader eyebrow="Visão geral" title="Dashboard" description="Alertas importantes sem executar nenhuma ação financeira." />
    <StatusMessage error={params.erro} success={params.sucesso}/><div className="grid gap-4 sm:grid-cols-3">{cards.map(card => <Link key={card.label} href={card.href}><Card><p className="text-sm text-[var(--muted)]">{card.label}</p><p className="mt-2 text-3xl font-bold">{card.count}</p></Card></Link>)}</div>
    {isIptuAlert && <Card className="mt-5 border-amber-300 bg-amber-50"><p className="font-bold">Mariana, hoje é 10 de março: abrir processo dos IPTUs anuais.</p></Card>}
    <section className="mt-6"><h2 className="mb-3 text-lg font-bold">Vencimentos próximos</h2>{expiring.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhum contrato vence nos próximos 30 dias.</p></Card> : <div className="grid gap-3">{expiring.map(c => <Card key={c.id}><p className="font-bold">{c.property.title}</p><p className="mt-1 text-sm text-[var(--muted)]">Vence em {daysUntil(c.endDate, now)} dia(s).</p><div className="mt-3 flex flex-wrap gap-2"><form action={markMovingOut}><input type="hidden" name="id" value={c.id}/><button className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold">Em desocupação</button></form><form action={renewContract} className="flex gap-2"><input type="hidden" name="id" value={c.id}/><input type="date" name="endDate" required className="rounded-xl border border-[var(--border)] px-2 text-sm"/><button className="rounded-xl bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white">Renovar</button></form></div></Card>)}</div>}</section>
    <Link href="/essa-semana" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white">Ir para Essa Semana</Link>
  </>;
}
