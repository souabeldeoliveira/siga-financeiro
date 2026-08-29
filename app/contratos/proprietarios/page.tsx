import Link from "next/link";

import { createOwner, deleteOwner } from "../cadastros-actions";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Card } from "@/components/cards/Card";
import { PersonForm } from "@/components/forms/PersonForm";
import { CadastrosNav } from "@/components/layout/CadastrosNav";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Proprietários" };

type PageProps = { searchParams: Promise<{ erro?: string; sucesso?: string }> };

export default async function ProprietariosPage({ searchParams }: PageProps) {
  await requireAdmin();
  const [params, owners] = await Promise.all([
    searchParams,
    prisma.owner.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, phone: true, email: true, document: true, notes: true } }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Cadastros básicos" title="Proprietários" description="Cadastre as pessoas proprietárias que serão vinculadas aos imóveis e contratos." />
      <CadastrosNav />
      <StatusMessage error={params.erro} success={params.sucesso} />
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Novo proprietário</h2>
        <PersonForm action={createOwner} cancelHref="/contratos" submitLabel="Cadastrar proprietário" />
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-bold">Proprietários cadastrados</h2><span className="text-sm text-[var(--muted)]">{owners.length} registro(s)</span></div>
        {owners.length === 0 ? <Card><p className="text-sm text-[var(--muted)]">Nenhum proprietário cadastrado ainda.</p></Card> : (
          <div className="grid gap-3">
            {owners.map((owner) => (
              <Card key={owner.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold">{owner.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{[owner.phone, owner.email].filter(Boolean).join(" · ") || "Sem contato informado"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/contratos/proprietarios/${owner.id}/editar`} className="min-h-10 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--brand-dark)] transition hover:bg-emerald-50">Editar</Link>
                  <DeleteButton action={deleteOwner} id={owner.id} entityLabel={owner.name} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
