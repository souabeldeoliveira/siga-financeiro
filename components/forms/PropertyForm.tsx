import Link from "next/link";

import { SubmitButton } from "@/components/buttons/SubmitButton";
import { Card } from "@/components/cards/Card";

type OwnerOption = { id: string; name: string };
type PropertyDefaults = {
  ownerId?: string;
  title?: string;
  address?: string;
  city?: string | null;
  state?: string | null;
  status?: string;
  notes?: string | null;
};

type PropertyFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string;
  defaults?: PropertyDefaults;
  owners: OwnerOption[];
  submitLabel: string;
};

const inputClass = "min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm outline-none transition focus:border-[var(--brand)]";

export function PropertyForm({ action, cancelHref, defaults = {}, owners, submitLabel }: PropertyFormProps) {
  return (
    <Card>
      <form action={action} className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Proprietário *</span>
          <select className={inputClass} name="ownerId" defaultValue={defaults.ownerId ?? ""} required>
            <option value="" disabled>Selecione</option>
            {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Título do imóvel *</span>
          <input className={inputClass} name="title" defaultValue={defaults.title} required maxLength={160} placeholder="Ex.: Apartamento Centro" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Endereço *</span>
          <input className={inputClass} name="address" defaultValue={defaults.address} required maxLength={240} autoComplete="street-address" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Cidade</span>
          <input className={inputClass} name="city" defaultValue={defaults.city ?? ""} maxLength={120} autoComplete="address-level2" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Estado</span>
          <input className={inputClass} name="state" defaultValue={defaults.state ?? ""} maxLength={2} placeholder="MG" autoComplete="address-level1" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Status *</span>
          <select className={inputClass} name="status" defaultValue={defaults.status ?? "VACANT"} required>
            <option value="VACANT">Vago</option>
            <option value="OCCUPIED">Ocupado</option>
            <option value="INACTIVE">Inativo</option>
          </select>
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
