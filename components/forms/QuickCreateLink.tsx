import Link from "next/link";

type Props = {
  href: string;
  label: string;
};

export function QuickCreateLink({ href, label }: Props) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-dashed border-[var(--brand)] px-3 text-xs font-bold text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
    >
      + Cadastrar {label}
    </Link>
  );
}
