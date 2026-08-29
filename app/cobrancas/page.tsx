import { updateCharges } from "./actions";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Cobranças" };
type PageProps = { searchParams: Promise<{ sucesso?: string }> };
const labels = { D5: "D+5", D7: "D+7", D10: "D+10", D15: "D+15", D20: "D+20", D30: "D+30", MANUAL_DECISION: "Decisão manual" } as const;

export default async function CobrancasPage({ searchParams }: PageProps) {
  await requireAdmin();
  const [params, charges] = await Promise.all([
    searchParams,
    prisma.charge.findMany({ where: { status: "OPEN" }, orderBy: { monthlyObligation: { dueDate: "asc" } }, include: { contract: { include: { tenant: true, property: true } }, monthlyObligation: true } }),
  ]);
  return (
    <>
      <PageHeader eyebrow="Inadimplência" title="Cobranças" description="Acompanhe contratos sem comprovante de aluguel após o vencimento." />
      <StatusMessage success={params.sucesso} />
      <Card>
        <form action={updateCharges}><SubmitButton>Atualizar cobranças</SubmitButton></form>
        <p className="mt-3 text-sm text-[var(--muted)]">A cobrança começa em D+5 e é resolvida quando o comprovante do aluguel é recebido.</p>
      </Card>
      <section className="mt-6 grid gap-4">
        {charges.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Não há cobranças abertas.</p></Card> : charges.map((charge) => (
          <Card key={charge.id}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{charge.contract.tenant.name}</h2><span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-800">{labels[charge.stage]}</span></div>
            <p className="mt-1 text-sm text-[var(--muted)]">{charge.contract.property.title} · competência {charge.monthlyObligation.competence}</p>
            <p className="mt-2 text-sm">Vencimento: {formatDate(charge.monthlyObligation.dueDate)}</p>
          </Card>
        ))}
      </section>
    </>
  );
}
