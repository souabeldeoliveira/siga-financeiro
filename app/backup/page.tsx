import Link from "next/link";
import { Card } from "@/components/cards/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/auth";
export const metadata = { title: "Backup" };
export default async function BackupPage() {
  await requireAdmin();
  return <><PageHeader eyebrow="Segurança dos dados" title="Backup" description="Baixe uma cópia completa dos dados do SIGA em formato JSON." /><Card><p className="text-sm leading-6 text-[var(--muted)]">A exportação é somente leitura: ela não altera contratos, competências nem dados financeiros.</p><Link href="/backup/export" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white">Baixar backup JSON</Link></Card></>;
}
