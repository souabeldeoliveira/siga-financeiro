"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { createDiscount } from "@/lib/discounts";

function redirectWith(kind: "erro" | "sucesso", message: string): never { redirect("/descontos-no-repasse?" + kind + "=" + encodeURIComponent(message)); }
export async function registerDiscount(formData: FormData) {
  await requireAdmin();
  try {
    const description = String(formData.get("description") || "").trim();
    const raw = String(formData.get("amount") || "").replace(/\./g, "").replace(",", ".");
    const count = Number(formData.get("installmentCount") || 1);
    const type = String(formData.get("type") || "");
    if (!description) throw new Error("Informe a especificação do desconto.");
    if (!["REPAIR", "BILL", "OTHER"].includes(type)) throw new Error("Selecione um tipo válido.");
    if (!Number.isInteger(count) || count < 1 || count > 120) throw new Error("Quantidade de parcelas inválida.");
    const amount = new Prisma.Decimal(raw);
    if (amount.lte(0)) throw new Error("Informe um valor válido.");
    const discount = await createDiscount({ contractId: String(formData.get("contractId") || ""), type: type as "REPAIR" | "BILL" | "OTHER", description, totalAmount: amount, installmentCount: count, notes: String(formData.get("notes") || "").trim() || null });
    await recordAudit({ action: "discount_created", entityType: "Discount", entityId: discount.id, contractId: discount.contractId, message: description, metadata: { amount: amount.toString(), installments: count } });
    revalidatePath("/descontos-no-repasse"); revalidatePath("/essa-semana");
    redirectWith("sucesso", "Desconto registrado.");
  } catch (error) { redirectWith("erro", error instanceof Error ? error.message : "Não foi possível registrar o desconto."); }
}
