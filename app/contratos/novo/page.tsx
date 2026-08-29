import { createContract } from "../actions";
import { ContractForm } from "@/components/forms/ContractForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { searchParams: Promise<{ erro?: string }> };
export default async function NovoContratoPage({ searchParams }: PageProps) {
  await requireAdmin();
  const [query, owners, tenants, properties] = await Promise.all([
    searchParams,
    prisma.owner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tenant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.property.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, address: true, ownerId: true, owner: { select: { name: true } } } }),
  ]);
  return (
    <>
      <PageHeader eyebrow="Contratos" title="Novo contrato" description="Preencha a ficha principal da locação. Nenhuma cobrança será criada automaticamente." />
      <StatusMessage error={query.erro} />
      <ContractForm action={createContract} cancelHref="/contratos" owners={owners} tenants={tenants} properties={properties} submitLabel="Cadastrar contrato" />
    </>
  );
}
