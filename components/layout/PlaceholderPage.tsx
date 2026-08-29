import { Card } from "@/components/cards/Card";

import { PageHeader } from "./PageHeader";

type PlaceholderPageProps = { eyebrow: string; title: string; description: string };

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card>
        <p className="text-sm font-semibold text-[var(--foreground)]">Estrutura preparada</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Esta página é apenas um ponto de partida visual. Nenhuma regra financeira foi ativada.</p>
      </Card>
    </>
  );
}
