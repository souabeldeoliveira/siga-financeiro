import { ContractStatus } from "@prisma/client";
import Link from "next/link";
import { deleteContract } from "./actions";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Card } from "@/components/cards/Card";
import { CadastrosNav } from "@/components/layout/CadastrosNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Contratos" };
type PageProps = { searchParams: Promise<{ erro?: string; sucesso?: string; status?: string }> };
const statusLabels = { ACTIVE: "Ativo", VACANT: "Vago", CLOSED: "Encerrado" } as const;
function formatMoney(value: { toString(): string }) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value.toString()));
}
function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(value);
}

export default async function ContratosPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const selectedStatus = Object.values(ContractStatus).includes(params.status as ContractStatus) ? params.status as ContractStatus : undefined;
  const [contracts, owners, tenants, properties] = await Promise.all([
    prisma.contract.findMany({
      where: selectedStatus ? { status: selectedStatus } : undefined,
      orderBy: [{ status: "asc" }, { endDate: "asc" }],
      include: { owner: { select: { name: true } }, tenant: { select: { name: true } }, property: { select: { title: true, address: true } } },
    }),
    prisma.owner.count(), prisma.tenant.count(), prisma.property.count(),
  ]);
  const ready = owners > 0 && tenants > 0 && properties > 0;
  return (
    <>
      <PageHeader eyebrow="Gestão de locações" title="Contratos" description="Cadastre e consulte as condições principais de cada locação." />
      <CadastrosNav />
      <StatusMessage error={params.erro} success={params.sucesso} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link href="/contratos" className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold">Todos</Link>
          {Object.entries(statusLabels).map(([value, label]) => <Link key={value} href={"/contratos?status=" + value} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold">{label}</Link>)}
        </div>
        {ready && <Link href="/contratos/novo" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white">+ Novo contrato</Link>}
      </div>
      {!ready ? (
        <Card>
          <h2 className="font-bold">Antes do primeiro contrato</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">É necessário ter pelo menos um proprietário, um inquilino e um imóvel cadastrados.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold" href="/contratos/proprietarios">Proprietários ({owners})</Link>
            <Link className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold" href="/contratos/inquilinos">Inquilinos ({tenants})</Link>
            <Link className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold" href="/contratos/imoveis">Imóveis ({properties})</Link>
          </div>
        </Card>
      ) : contracts.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhum contrato encontrado.</p></Card> : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{contract.property.title}</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[var(--brand-dark)]">{statusLabels[contract.status]}</span></div>
                <p className="mt-1 text-sm text-[var(--muted)]">{contract.tenant.name} · {contract.property.address}</p>
                <p className="mt-2 text-sm font-semibold">{formatMoney(contract.rentAmount)} · vence dia {contract.dueDay}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Proprietário: {contract.owner.name} · {formatDate(contract.startDate)} a {formatDate(contract.endDate)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Link href={"/contratos/" + contract.id} className="min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--brand-dark)] hover:bg-emerald-50">Ver detalhes</Link>
                <Link href={"/contratos/" + contract.id + "/editar"} className="min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--brand-dark)] hover:bg-emerald-50">Editar</Link>
                <DeleteButton action={deleteContract} id={contract.id} entityLabel={"o contrato de " + contract.tenant.name} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
