import { notFound } from "next/navigation";
import { updateContract } from "../../actions";
import { ContractForm } from "@/components/forms/ContractForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> };
function dateInput(value: Date) { return value.toISOString().slice(0, 10); }
export default async function EditarContratoPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [contract, owners, tenants, properties] = await Promise.all([
    prisma.contract.findUnique({ where: { id } }),
    prisma.owner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tenant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.property.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, address: true, ownerId: true, owner: { select: { name: true } } } }),
  ]);
  if (!contract) notFound();
  const defaults = {
    ...contract, rentAmount: contract.rentAmount.toFixed(2).replace(".", ","),
    dueDay: String(contract.dueDay), startDate: dateInput(contract.startDate), endDate: dateInput(contract.endDate),
  };
  return (
    <>
      <PageHeader eyebrow="Contratos" title="Editar contrato" description="Atualize a ficha da locação sem criar movimentações financeiras." />
      <StatusMessage error={query.erro} />
      <ContractForm action={updateContract.bind(null, contract.id)} cancelHref={"/contratos/" + contract.id} defaults={defaults} owners={owners} tenants={tenants} properties={properties} submitLabel="Salvar alterações" />
    </>
  );
}
