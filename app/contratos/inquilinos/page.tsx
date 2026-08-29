import Link from "next/link";

import { createTenant, deleteTenant } from "../cadastros-actions";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Card } from "@/components/cards/Card";
import { PersonForm } from "@/components/forms/PersonForm";
import { CadastrosNav } from "@/components/layout/CadastrosNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Inquilinos" };

type PageProps = { searchParams: Promise<{ erro?: string; sucesso?: string }> };

export default async function InquilinosPage({ searchParams }: PageProps) {
  await requireAdmin();
  const [params, tenants] = await Promise.all([
    searchParams,
    prisma.tenant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, phone: true, email: true, document: true, notes: true } }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Cadastros básicos" title="Inquilinos" description="Cadastre as pessoas que poderão ser vinculadas aos contratos de locação." />
      <CadastrosNav />
      <StatusMessage error={params.erro} success={params.sucesso} />
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Novo inquilino</h2>
        <PersonForm action={createTenant} cancelHref="/contratos" submitLabel="Cadastrar inquilino" />
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-bold">Inquilinos cadastrados</h2><span className="text-sm text-[var(--muted)]">{tenants.length} registro(s)</span></div>
        {tenants.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhum inquilino cadastrado ainda.</p></Card> : (
          <div className="grid gap-3">
            {tenants.map((tenant) => (
              <Card key={tenant.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><h3 className="font-bold">{tenant.name}</h3><p className="mt-1 text-sm text-[var(--muted)]">{[tenant.phone, tenant.email].filter(Boolean).join(" · ") || "Sem contato informado"}</p></div>
                <div className="flex items-center gap-1">
                  <Link href={`/contratos/inquilinos/${tenant.id}/editar`} className="min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-emerald-50">Editar</Link>
                  <DeleteButton action={deleteTenant} id={tenant.id} entityLabel={tenant.name} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
