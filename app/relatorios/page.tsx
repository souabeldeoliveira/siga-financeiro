import { createReport, updateReport } from "./actions";
import { Card } from "@/components/cards/Card";
import { QuickCreateLink } from "@/components/forms/QuickCreateLink";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusMessage } from "@/components/layout/StatusMessage";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const metadata = { title: "Relatórios" };
type Props={searchParams:Promise<{sucesso?:string}>};
export default async function RelatoriosPage({searchParams}:Props) {
  await requireAdmin(); const [params,reports,owners]=await Promise.all([searchParams,prisma.annualReport.findMany({include:{owner:true,contract:{include:{property:true}}},orderBy:{year:"desc"}}),prisma.owner.findMany({orderBy:{name:"asc"}})]);
  return <><PageHeader eyebrow="Histórico" title="Relatórios anuais" description="Acompanhe a geração e o envio dos relatórios por proprietário."/><StatusMessage success={params.sucesso}/><Card><form action={createReport} className="flex flex-wrap gap-3"><div><select name="ownerId" className="min-h-11 rounded-xl border border-[var(--border)] px-3">{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select><QuickCreateLink href="/contratos/proprietarios" label="proprietário" /></div><input name="year" type="number" defaultValue={new Date().getFullYear()} className="min-h-11 rounded-xl border border-[var(--border)] px-3"/><button className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Criar relatório</button></form></Card><section className="grid gap-3 mt-5">{reports.length===0?<Card><p className="text-sm text-[var(--muted)]">Nenhum relatório anual criado ainda.</p></Card>:reports.map(r=><Card key={r.id}><h2 className="font-bold">{r.owner.name} · {r.year}</h2><p className="mt-1 text-sm text-[var(--muted)]">{r.contract?.property.title??"Sem contrato específico"} · {r.status==="NOT_GENERATED"?"Não gerado":r.status==="GENERATED"?"Gerado":"Enviado"}</p>{r.status==="NOT_GENERATED"&&<form action={updateReport} className="mt-3"><input name="id" type="hidden" value={r.id}/><button name="action" value="generate" className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Marcar como gerado</button></form>}{r.status==="GENERATED"&&<form action={updateReport} className="mt-3"><input name="id" type="hidden" value={r.id}/><button name="action" value="send" className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Marcar como enviado</button></form>}</Card>)}</section></>;
}
