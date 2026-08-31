import Link from "next/link";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { Card } from "@/components/cards/Card";

type Option = { id: string; name: string };
type PropertyOption = { id: string; title: string; address: string; ownerId: string; owner: { name: string } };
type ContractDefaults = Partial<Record<
  "ownerId" | "tenantId" | "propertyId" | "rentAmount" | "startDate" | "endDate" | "dueDay" |
  "paymentType" | "guaranteeType" | "iptuResponsibility" | "cemigHolder" |
  "administrationFeeType" | "intermediationFeeType" | "status" | "lifecycleStatus" | "notes",
  string | null
>>;
type Props = {
  action: (formData: FormData) => void | Promise<void>;
  cancelHref: string; defaults?: ContractDefaults; owners: Option[]; tenants: Option[];
  properties: PropertyOption[]; submitLabel: string;
};
const inputClass = "min-h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm outline-none transition focus:border-[var(--brand)]";
function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>;
}

export function ContractForm({ action, cancelHref, defaults = {}, owners, tenants, properties, submitLabel }: Props) {
  return (
    <Card>
      <form action={action} className="grid gap-5 sm:grid-cols-2">
        <Field label="Proprietário *">
          <select className={inputClass} name="ownerId" defaultValue={defaults.ownerId ?? ""} required>
            <option value="" disabled>Selecione</option>
            {owners.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
        <Field label="Inquilino *">
          <select className={inputClass} name="tenantId" defaultValue={defaults.tenantId ?? ""} required>
            <option value="" disabled>Selecione</option>
            {tenants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </Field>
        <Field label="Imóvel *" wide>
          <select className={inputClass} name="propertyId" defaultValue={defaults.propertyId ?? ""} required>
            <option value="" disabled>Selecione</option>
            {properties.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.owner.name} — {item.address}</option>)}
          </select>
          <span className="mt-1.5 block text-xs text-[var(--muted)]">O imóvel precisa pertencer ao proprietário selecionado.</span>
        </Field>
        <Field label="Valor mensal do aluguel *">
          <input className={inputClass} name="rentAmount" defaultValue={defaults.rentAmount ?? ""} required inputMode="decimal" placeholder="Ex.: 1.200,00" />
        </Field>
        <Field label="Dia do vencimento *">
          <input className={inputClass} name="dueDay" type="number" min={1} max={31} defaultValue={defaults.dueDay ?? "10"} required />
        </Field>
        <Field label="Data de início *"><input className={inputClass} name="startDate" type="date" defaultValue={defaults.startDate ?? ""} required /></Field>
        <Field label="Data de término *"><input className={inputClass} name="endDate" type="date" defaultValue={defaults.endDate ?? ""} required /></Field>
        <Field label="Tipo de pagamento *">
          <select className={inputClass} name="paymentType" defaultValue={defaults.paymentType ?? "ADVANCE"} required><option value="ADVANCE">Adiantado</option><option value="ARREARS">Vencido</option></select>
        </Field>
        <Field label="Garantia *">
          <select className={inputClass} name="guaranteeType" defaultValue={defaults.guaranteeType ?? "CAUTION"} required><option value="CAUTION">Caução</option><option value="BOOZ">Booz</option><option value="LOFT">Loft</option><option value="INSURANCE">Seguro-fiança</option></select>
        </Field>
        <Field label="Responsável pelo IPTU *">
          <select className={inputClass} name="iptuResponsibility" defaultValue={defaults.iptuResponsibility ?? "OWNER"} required><option value="OWNER">Proprietário</option><option value="TENANT">Inquilino</option></select>
        </Field>
        <Field label="Conta de energia em nome de *">
          <select className={inputClass} name="cemigHolder" defaultValue={defaults.cemigHolder ?? "TENANT"} required><option value="TENANT">Inquilino</option><option value="OWNER">Proprietário</option><option value="THIRD_PARTY">Terceiro</option></select>
        </Field>
        <Field label="Taxa de administração *">
          <select className={inputClass} name="administrationFeeType" defaultValue={defaults.administrationFeeType ?? "COMMON_RENTAL_10"} required><option value="COMMON_RENTAL_10">Locação comum — 10%</option><option value="SEASONAL_20">Temporada — 20%</option></select>
        </Field>
        <Field label="Taxa de intermediação *">
          <select className={inputClass} name="intermediationFeeType" defaultValue={defaults.intermediationFeeType ?? "EXEMPT"} required><option value="EXEMPT">Isento</option><option value="FIFTY_AFTER_THREE_MONTHS">50% após três meses</option></select>
        </Field>
        <Field label="Status principal *">
          <select className={inputClass} name="status" defaultValue={defaults.status ?? "ACTIVE"} required><option value="ACTIVE">Ativo</option><option value="VACANT">Vago</option><option value="CLOSED">Encerrado</option></select>
        </Field>
        <Field label="Situação atual *">
          <select className={inputClass} name="lifecycleStatus" defaultValue={defaults.lifecycleStatus ?? "NORMAL"} required><option value="NORMAL">Normal</option><option value="EXPIRING">Vencendo</option><option value="RENEWED">Renovado</option><option value="MOVING_OUT">Em desocupação</option></select>
        </Field>
        <Field label="Observações" wide>
          <textarea className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[var(--brand)]" name="notes" defaultValue={defaults.notes ?? ""} maxLength={2000} />
        </Field>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link href={cancelHref} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50">Cancelar</Link>
        </div>
      </form>
    </Card>
  );
}
