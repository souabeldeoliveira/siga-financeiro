import { generateCompetence, markDiscountProofSentToOwner, markEnergyReceived, markIptuPaid, markRentProofSentToOwner, markRentReceived, markTransferCompleted, markWaterReceived } from "./actions";
import { calculateTransfer, ownerTransferMessage } from "@/lib/transfers";
import { formatMoney } from "@/lib/money";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { competenceFromDate } from "@/lib/dates";
import { isGuaranteeContract } from "@/lib/contracts";
import { nextDiscountInstallments } from "@/lib/discounts";
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
        OR: [
          { rentStatus: "PENDING" }, { waterStatus: "PENDING" }, { energyStatus: "PENDING" }, { iptuStatus: "PENDING" }, { transferStatus: "PENDING" },
          { AND: [{ transferStatus: "COMPLETED" }, { rentProofSentToOwnerAt: null }] },
          { AND: [{ transferStatus: "COMPLETED" }, { discountProofSentToOwnerAt: null }, { transfer: { is: { discountAmount: { gt: 0 } } } }] },
        ],
      },
      orderBy: { dueDate: "asc" },
      include: {
        transfer: true,
        discountInstallments: { include: { discount: true } },
        contract: { include: {
          owner: true, tenant: true, property: true,
          discounts: { where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" }, include: { installments: { where: { status: "PENDING" }, orderBy: { installmentNumber: "asc" }, include: { discount: true } } } },
        } },
      },
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
        {obligations.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhuma pendência vencida para tratar agora.</p></Card> : obligations.map((item) => {
          const applicableDiscounts = nextDiscountInstallments(item.contract.discounts.flatMap((discount) => discount.installments));
          const calculation = calculateTransfer(item.contract, item.competence, applicableDiscounts.map((installment) => installment.amount));
          return <Card key={item.id}>
            <h3 className="font-bold">{item.contract.property.title} · {item.contract.tenant.name}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">Competência {item.competence} · vencimento {new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(item.dueDate)}</p>
            {item.transferStatus !== "COMPLETED" && (item.rentStatus === "COMPLETED" || isGuaranteeContract(item.contract)) && <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
              {calculation.isReleasedByGuarantee && item.rentStatus !== "COMPLETED" && <p className="mb-2 font-semibold text-[var(--brand)]">Repasse liberado — fiança {item.contract.guaranteeType === "INSURANCE" ? "seguro-fiança" : item.contract.guaranteeType === "BOOZ" ? "Booz" : "Loft"}.</p>}
              <p>Aluguel: {formatMoney(calculation.grossRentAmount)}</p>
              {calculation.administrationFeeAmount.gt(0) && <p>Taxa de administração: -{formatMoney(calculation.administrationFeeAmount)}</p>}
              {calculation.intermediationFeeAmount.gt(0) && <p>Taxa de intermediação: -{formatMoney(calculation.intermediationFeeAmount)}</p>}
              {applicableDiscounts.map((installment) => <p key={installment.id}>Desconto: {installment.discount.description} ({installment.installmentNumber}/{installment.totalInstallments}): -{formatMoney(installment.amount)}</p>)}
              <p className="mt-2 font-bold">Valor a repassar: {formatMoney(calculation.netTransferAmount)}</p>
            </div>}
            <div className="mt-4 flex flex-wrap gap-2">
              {item.rentStatus === "PENDING" && <form action={markRentReceived}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Comprovante de aluguel recebido</button></form>}
              {item.waterStatus === "PENDING" && <form action={markWaterReceived}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Comprovante de água recebido</button></form>}
              {item.energyStatus === "PENDING" && <form action={markEnergyReceived}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Comprovante de energia recebido</button></form>}
              {item.iptuStatus === "PENDING" && <form action={markIptuPaid}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">IPTU pago</button></form>}
              {item.transferStatus !== "COMPLETED" && (item.rentStatus === "COMPLETED" || isGuaranteeContract(item.contract)) && <form action={markTransferCompleted}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Concluir repasse ({formatMoney(calculation.netTransferAmount)})</button></form>}
              {item.transferStatus === "COMPLETED" && !item.rentProofSentToOwnerAt && <form action={markRentProofSentToOwner}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Comprovante de aluguel enviado ao proprietário</button></form>}
              {item.transferStatus === "COMPLETED" && item.transfer && item.transfer.discountAmount.gt(0) && !item.discountProofSentToOwnerAt && <form action={markDiscountProofSentToOwner}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Comprovante do desconto enviado ao proprietário</button></form>}
            </div>
            {item.transfer?.status === "COMPLETED" && <details className="mt-4 rounded-xl bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-bold">Mensagem ao proprietário</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{ownerTransferMessage({ ownerName: item.contract.owner.name, propertyTitle: item.contract.property.title, tenantName: item.contract.tenant.name, transfer: item.transfer, discountInstallments: item.discountInstallments })}</p></details>}
          </Card>;
        })}
      </section>
    </>
  );
}
