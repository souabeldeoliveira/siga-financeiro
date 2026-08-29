import Link from "next/link";

import { createProperty, deleteProperty } from "../cadastros-actions";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Card } from "@/components/cards/Card";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { CadastrosNav } from "@/components/layout/CadastrosNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Imóveis" };

type PageProps = { searchParams: Promise<{ erro?: string; sucesso?: string }> };

const statusLabels = { VACANT: "Vago", OCCUPIED: "Ocupado", INACTIVE: "Inativo" } as const;

export default async function ImoveisPage({ searchParams }: PageProps) {
  await requireAdmin();
  const [params, owners, properties] = await Promise.all([
    searchParams,
    prisma.owner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.property.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, address: true, city: true, state: true, status: true, owner: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Cadastros básicos" title="Imóveis" description="Cadastre os imóveis administrados e vincule cada um ao respectivo proprietário." />
      <CadastrosNav />
      <StatusMessage error={params.erro} success={params.sucesso} />
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Novo imóvel</h2>
        {owners.length === 0 ? (
          <Card>
            <p className="text-sm leading-6 text-[var(--muted)]">Cadastre pelo menos um proprietário antes de adicionar um imóvel.</p>
            <Link href="/contratos/proprietarios" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white">Cadastrar proprietário</Link>
          </Card>
        ) : <PropertyForm action={createProperty} cancelHref="/contratos" owners={owners} submitLabel="Cadastrar imóvel" />}
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-bold">Imóveis cadastrados</h2><span className="text-sm text-[var(--muted)]">{properties.length} registro(s)</span></div>
        {properties.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhum imóvel cadastrado ainda.</p></Card> : (
          <div className="grid gap-3">
            {properties.map((property) => (
              <Card key={property.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{property.title}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">{statusLabels[property.status]}</span></div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{property.address}{property.city ? ` · ${property.city}${property.state ? `/${property.state}` : ""}` : ""}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--brand-dark)]">Proprietário: {property.owner.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/contratos/imoveis/${property.id}/editar`} className="min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-emerald-50">Editar</Link>
                  <DeleteButton action={deleteProperty} id={property.id} entityLabel={property.title} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
