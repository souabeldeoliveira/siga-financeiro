import { generateCompetence, markEnergyReceived, markIptuPaid, markRentReceived, markTransferCompleted, markWaterReceived } from "./actions";
import { calculateTransfer } from "@/lib/transfers";
import { formatMoney } from "@/lib/money";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { competenceFromDate } from "@/lib/dates";
import { isGuaranteeContract } from "@/lib/contracts";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Essa Semana" };
type PageProps = { searchParams: Promise<{ erro?: string; sucesso?: string }> };

export default async function EssaSemanaPage({ searchParams }: PageProps) {
  await requireAdmin();
  const [params, count, obligations] = await Promise.all([
    searchParams,
    prisma.monthlyObligation.count(),
    prisma.monthlyObligation.findMany({
      where: {
        dueDate: { lte: new Date() },
        OR: [{ rentStatus: "PENDING" }, { waterStatus: "PENDING" }, { energyStatus: "PENDING" }, { iptuStatus: "PENDING" }, { transferStatus: "PENDING" }],
      },
      orderBy: { dueDate: "asc" },
      include: { transfer: true, contract: { include: { owner: true, tenant: true, property: true } } },
    }),
  ]);
  const current = competenceFromDate(new Date());
  return (
    <>
      <PageHeader eyebrow="Rotina operacional" title="Essa Semana" description="Prepare as obrigações mensais e acompanhe somente as pendências reais." />
      <StatusMessage error={params.erro} success={params.sucesso} />
      <Card>
        <h2 className="font-bold">Preparar o mês</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Esta ação cria uma única competência por contrato ativo, sem gerar cobranças ou repasses automaticamente.</p>
        <form action={generateCompetence} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block"><span className="mb-2 block text-sm font-semibold">Competência</span><input className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm" type="month" name="competence" defaultValue={current} required /></label>
          <SubmitButton>Preparar competências</SubmitButton>
        </form>
      </Card>
      <p className="mt-5 text-sm text-[var(--muted)]">{count} competência(s) registrada(s) no sistema.</p>
      <section className="mt-6 grid gap-4">
        <h2 className="text-lg font-bold">Pendências reais</h2>
        {obligations.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhuma pendência vencida para tratar agora.</p></Card> : obligations.map((item) => (
          <Card key={item.id}>
            <h3 className="font-bold">{item.contract.property.title} · {item.contract.tenant.name}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">Competência {item.competence} · vencimento {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(item.dueDate)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.rentStatus === "PENDING" && <form action={markRentReceived}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Comprovante de aluguel recebido</button></form>}
              {item.waterStatus === "PENDING" && <form action={markWaterReceived}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Comprovante de água recebido</button></form>}
              {item.energyStatus === "PENDING" && <form action={markEnergyReceived}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Comprovante de energia recebido</button></form>}
              {item.iptuStatus === "PENDING" && <form action={markIptuPaid}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">IPTU pago</button></form>}
              {item.transferStatus !== "COMPLETED" && (item.rentStatus === "COMPLETED" || isGuaranteeContract(item.contract)) && <form action={markTransferCompleted}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Concluir repasse ({formatMoney(calculateTransfer(item.contract, item.competence).netTransferAmount)})</button></form>}
            </div>
            {item.transfer?.status === "COMPLETED" && <details className="mt-4 rounded-xl bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-bold">Mensagem ao proprietário</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">Olá, {item.contract.owner.name}.{"\n\n"}Segue o resumo do repasse referente ao imóvel {item.contract.property.title}, locado para {item.contract.tenant.name}.{"\n\n"}Aluguel: {formatMoney(item.transfer.grossRentAmount)}{"\n"}Taxa de administração: -{formatMoney(item.transfer.administrationFeeAmount)}{"\n"}Intermediação: -{formatMoney(item.transfer.intermediationFeeAmount)}{"\n"}Descontos: -{formatMoney(item.transfer.discountAmount)}{"\n"}Valor repassado: {formatMoney(item.transfer.netTransferAmount)}{"\n\n"}Comprovantes poderão ser enviados para conferência.</p></details>}
          </Card>
        ))}
      </section>
    </>
  );
}
