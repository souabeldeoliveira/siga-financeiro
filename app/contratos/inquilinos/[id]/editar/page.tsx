import { notFound } from "next/navigation";

import { updateTenant } from "../../../cadastros-actions";
import { PersonForm } from "@/components/forms/PersonForm";
import { CadastrosNav } from "@/components/layout/CadastrosNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> };

export default async function EditarInquilinoPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { id: true, name: true, phone: true, email: true, document: true, notes: true } });
  if (!tenant) notFound();

  return (
    <>
      <PageHeader eyebrow="Inquilinos" title="Editar inquilino" description="Atualize os dados cadastrais sem alterar vínculos financeiros." />
      <CadastrosNav />
      <StatusMessage error={query.erro} />
      <PersonForm action={updateTenant.bind(null, tenant.id)} cancelHref="/contratos/inquilinos" defaults={tenant} submitLabel="Salvar alterações" />
    </>
  );
}
