type PageHeaderProps = { eyebrow?: string; title: string; description: string };

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-7 max-w-3xl sm:mb-9">
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{eyebrow}</p> : null}
      <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">{description}</p>
    </header>
  );
}
