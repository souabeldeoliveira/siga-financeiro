"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { synchronizeCharges } from "@/lib/charges";

export async function updateCharges() {
  await requireAdmin();
  const total = await synchronizeCharges();
  revalidatePath("/cobrancas");
  revalidatePath("/dashboard");
  redirect("/cobrancas?sucesso=" + encodeURIComponent(total + " cobrança(s) atualizada(s)."));
}
