import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ sucesso?: string }> };
const labels: Record<string, string> = {
  ADVANCE: "Adiantado", ARREARS: "Vencido", CAUTION: "Caução", BOOZ: "Booz", LOFT: "Loft", INSURANCE: "Seguro-fiança",
  OWNER: "Proprietário", TENANT: "Inquilino", THIRD_PARTY: "Terceiro",
  COMMON_RENTAL_10: "Locação comum — 10%", SEASONAL_20: "Temporada — 20%",
  EXEMPT: "Isento", FIFTY_AFTER_THREE_MONTHS: "50% após três meses",
  ACTIVE: "Ativo", VACANT: "Vago", CLOSED: "Encerrado", NORMAL: "Normal",
  EXPIRING: "Vencendo", RENEWED: "Renovado", MOVING_OUT: "Em desocupação",
};
function date(value: Date) { return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(value); }
function money(value: { toString(): string }) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value.toString())); }

export default async function ContratoDetalhesPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const contract = await prisma.contract.findUnique({ where: { id }, include: { owner: true, tenant: true, property: true, auditLogs: { orderBy: { createdAt: "desc" }, take: 20 } } });
  if (!contract) notFound();
  const items = [
    ["Proprietário", contract.owner.name], ["Inquilino", contract.tenant.name],
    ["Imóvel", contract.property.title], ["Endereço", contract.property.address],
    ["Aluguel", money(contract.rentAmount)], ["Vencimento", "Dia " + contract.dueDay],
    ["Período", date(contract.startDate) + " a " + date(contract.endDate)],
    ["Pagamento", labels[contract.paymentType]], ["Garantia", labels[contract.guaranteeType]],
    ["Responsável pelo IPTU", labels[contract.iptuResponsibility]],
    ["Conta de energia em nome de", labels[contract.cemigHolder]],
    ["Administração", labels[contract.administrationFeeType]],
    ["Intermediação", labels[contract.intermediationFeeType]],
    ["Status", labels[contract.status]], ["Situação", labels[contract.lifecycleStatus]],
  ];
  return (
    <>
      <PageHeader eyebrow="Contratos" title={contract.property.title} description={contract.tenant.name + " · " + contract.owner.name} />
      <StatusMessage success={query.sucesso} />
      <Card>
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {items.map(([label, value]) => <div key={label}><dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}
        </dl>
        {contract.notes && <div className="mt-6 border-t border-[var(--border)] pt-5"><h2 className="text-sm font-bold">Observações</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{contract.notes}</p></div>}
        <div className="mt-6 border-t border-[var(--border)] pt-5"><h2 className="text-sm font-bold">Histórico</h2>{contract.auditLogs.length===0?<p className="mt-2 text-sm text-[var(--muted)]">Nenhum evento registrado ainda.</p>:<ul className="mt-2 grid gap-2">{contract.auditLogs.map(log=><li key={log.id} className="text-sm"><span className="font-semibold">{log.action}</span><span className="text-[var(--muted)]"> · {date(log.createdAt)} {log.message?"· "+log.message:""}</span></li>)}</ul>}</div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-5">
          <Link href={"/contratos/" + contract.id + "/editar"} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white">Editar contrato</Link>
          <Link href="/contratos" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold">Voltar</Link>
        </div>
      </Card>
    </>
  );
}
