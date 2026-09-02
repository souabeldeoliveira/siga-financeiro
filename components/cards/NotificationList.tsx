import Link from "next/link";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone?: "attention" | "warning" | "neutral";
};

type NotificationListProps = {
  title: string;
  items: NotificationItem[];
  emptyMessage?: string;
};

const toneClasses = {
  attention: "border-[#e7c6bd] bg-[#fff5f1] text-[#8b422f]",
  warning: "border-[#ead79d] bg-[#fffbed] text-[#795c1c]",
  neutral: "border-[#d9e2e7] bg-[#f5f8fa] text-[#526671]",
};

export function NotificationList({ title, items, emptyMessage = "Nenhum aviso importante no momento." }: NotificationListProps) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <span aria-hidden className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-sm text-white">!</span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {items.length === 0 ? <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">{emptyMessage}</p> : <div className="grid gap-3">
        {items.map((item) => <Link key={item.id} href={item.href} prefetch={true} className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 ${toneClasses[item.tone ?? "neutral"]}`}>
          <p className="font-bold">{item.title}</p>
          <p className="mt-1 text-sm leading-5 opacity-90">{item.description}</p>
          <p className="mt-3 text-sm font-bold underline underline-offset-4">Ver e resolver</p>
        </Link>)}
      </div>}
    </section>
  );
}
