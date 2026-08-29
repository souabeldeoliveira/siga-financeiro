import Link from "next/link";

const items = [
  { href: "/contratos", label: "Contratos" },
  { href: "/contratos/proprietarios", label: "Proprietários" },
  { href: "/contratos/inquilinos", label: "Inquilinos" },
  { href: "/contratos/imoveis", label: "Imóveis" },
] as const;

export function CadastrosNav() {
  return (
    <nav aria-label="Cadastros básicos" className="mb-7 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-emerald-300 hover:bg-emerald-50">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
