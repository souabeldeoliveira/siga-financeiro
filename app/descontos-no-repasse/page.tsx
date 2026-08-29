import { registerDiscount } from "./actions";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Descontos no Repasse" };
type PageProps = { searchParams: Promise<{ erro?: string; sucesso?: string }> };
const types = { REPAIR: "Reparo", BILL: "Conta", OTHER: "Outro" } as const;
export default async function DescontosNoRepassePage({ searchParams }: PageProps) {
  await requireAdmin();
  const [params, contracts, discounts] = await Promise.all([
    searchParams,
    prisma.contract.findMany({ where: { status: "ACTIVE" }, orderBy: { property: { title: "asc" } }, include: { property: true, tenant: true } }),
    prisma.discount.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, include: { contract: { include: { property: true } } } }),
  ]);
  return <><PageHeader eyebrow="Ajustes de repasse" title="Descontos no Repasse" description="Registre valores que serão abatidos de repasses futuros." /><StatusMessage error={params.erro} success={params.sucesso} />
    <Card><form action={registerDiscount} className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2"><span className="mb-1 block text-sm font-semibold">Contrato ativo *</span><select name="contractId" required className="min-h-11 w-full rounded-xl border border-[var(--border)] px-3">{contracts.map(c => <option key={c.id} value={c.id}>{c.property.title} — {c.tenant.name}</option>)}</select></label>
      <label><span className="mb-1 block text-sm font-semibold">Tipo *</span><select name="type" className="min-h-11 w-full rounded-xl border border-[var(--border)] px-3"><option value="REPAIR">Reparo</option><option value="BILL">Conta</option><option value="OTHER">Outro</option></select></label>
      <label><span className="mb-1 block text-sm font-semibold">Valor total *</span><input name="amount" required inputMode="decimal" placeholder="Ex.: 150,00" className="min-h-11 w-full rounded-xl border border-[var(--border)] px-3" /></label>
      <label className="sm:col-span-2"><span className="mb-1 block text-sm font-semibold">Especificar *</span><input name="description" required maxLength={240} className="min-h-11 w-full rounded-xl border border-[var(--border)] px-3" /></label>
      <label><span className="mb-1 block text-sm font-semibold">Quantidade de parcelas</span><input name="installmentCount" type="number" min={1} max={120} defaultValue={1} className="min-h-11 w-full rounded-xl border border-[var(--border)] px-3" /></label>
      <label><span className="mb-1 block text-sm font-semibold">Observações</span><input name="notes" maxLength={1000} className="min-h-11 w-full rounded-xl border border-[var(--border)] px-3" /></label>
      <div className="sm:col-span-2"><SubmitButton>Registrar desconto</SubmitButton></div>
    </form></Card>
    <section className="mt-6 grid gap-3">{discounts.map(d => <Card key={d.id}><h2 className="font-bold">{types[d.type]} · {d.description}</h2><p className="mt-1 text-sm text-[var(--muted)]">{d.contract.property.title} · {formatMoney(d.totalAmount)} em {d.installmentCount} parcela(s)</p></Card>)}</section>
  </>;
}
