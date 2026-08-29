import Link from "next/link";

import { SubmitButton } from "@/components/buttons/SubmitButton";
import { Card } from "@/components/cards/Card";

type PersonDefaults = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  document?: string | null;
  notes?: string | null;
};

type PersonFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
  defaults?: PersonDefaults;
  submitLabel: string;
};

const inputClass = "min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm outline-none transition focus:border-[var(--brand)]";

export function PersonForm({ action, cancelHref, defaults = {}, submitLabel }: PersonFormProps) {
  return (
    <Card>
      <form action={action} className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Nome *</span>
          <input className={inputClass} name="name" defaultValue={defaults.name} required maxLength={160} autoComplete="name" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Telefone</span>
          <input className={inputClass} name="phone" defaultValue={defaults.phone ?? ""} maxLength={40} autoComplete="tel" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">E-mail</span>
          <input className={inputClass} name="email" type="email" defaultValue={defaults.email ?? ""} maxLength={160} autoComplete="email" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">CPF ou CNPJ</span>
          <input className={inputClass} name="document" defaultValue={defaults.document ?? ""} maxLength={40} />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Observações</span>
          <textarea className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[var(--brand)]" name="notes" defaultValue={defaults.notes ?? ""} maxLength={2000} />
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link href={cancelHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </Card>
  );
}
