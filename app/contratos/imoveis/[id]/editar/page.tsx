import { notFound } from "next/navigation";

import { updateProperty } from "../../../cadastros-actions";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { CadastrosNav } from "@/components/layout/CadastrosNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> };

export default async function EditarImovelPage({ params, searchParams }: PageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [property, owners] = await Promise.all([
    prisma.property.findUnique({ where: { id }, select: { id: true, ownerId: true, title: true, address: true, city: true, state: true, status: true, notes: true } }),
    prisma.owner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!property) notFound();

  return (
    <>
      <PageHeader eyebrow="Imóveis" title="Editar imóvel" description="Atualize os dados cadastrais e o proprietário vinculado." />
      <CadastrosNav />
      <StatusMessage error={query.erro} />
      <PropertyForm action={updateProperty.bind(null, property.id)} cancelHref="/contratos/imoveis" defaults={property} owners={owners} submitLabel="Salvar alterações" />
    </>
  );
}
