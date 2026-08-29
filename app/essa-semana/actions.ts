"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { competenceFromDate } from "@/lib/dates";
import { generateCompetenceForActiveContracts } from "@/lib/obligations";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

function redirectWith(kind: "sucesso" | "erro", message: string): never {
  redirect("/essa-semana?" + kind + "=" + encodeURIComponent(message));
}

export async function generateCompetence(formData: FormData) {
  await requireAdmin();
  const raw = formData.get("competence");
  const competence = typeof raw === "string" && /^\d{4}-\d{2}$/.test(raw) ? raw : competenceFromDate(new Date());
  try {
    const created = await generateCompetenceForActiveContracts(competence);
    revalidatePath("/essa-semana");
    redirectWith("sucesso", created.length + " competência(s) preparada(s) para " + competence + ".");
  } catch {
    redirectWith("erro", "Não foi possível preparar as competências deste mês.");
  }
}

async function updateObligation(id: string, field: "rent" | "water" | "energy") {
  await requireAdmin();
  const obligation = await prisma.monthlyObligation.findUnique({ where: { id }, include: { contract: true } });
  if (!obligation) redirectWith("erro", "Competência não encontrada.");
  const now = new Date();
  if (field === "rent") {
    await prisma.$transaction([
      prisma.monthlyObligation.update({ where: { id }, data: { rentStatus: "COMPLETED", rentProofReceivedAt: now, chargeStatus: "RESOLVED" } }),
      prisma.paymentProof.create({ data: { contractId: obligation.contractId, monthlyObligationId: id, type: "RENT", receivedAt: now } }),
      prisma.charge.updateMany({ where: { monthlyObligationId: id, status: "OPEN" }, data: { status: "RESOLVED", resolvedAt: now } }),
    ]);
  } else if (field === "water") {
    await prisma.monthlyObligation.update({ where: { id }, data: { waterStatus: "COMPLETED", waterProofReceivedAt: now } });
  } else {
    await prisma.monthlyObligation.update({ where: { id }, data: { energyStatus: "COMPLETED", energyProofReceivedAt: now } });
  }
  await recordAudit({ action: field + "_proof_received", entityType: "MonthlyObligation", entityId: id, contractId: obligation.contractId, message: "Comprovante registrado." });
  revalidatePath("/essa-semana"); revalidatePath("/cobrancas"); revalidatePath("/dashboard");
  redirectWith("sucesso", "Pendência atualizada.");
}

export async function markRentReceived(formData: FormData) { await updateObligation(String(formData.get("id") || ""), "rent"); }
export async function markWaterReceived(formData: FormData) { await updateObligation(String(formData.get("id") || ""), "water"); }
export async function markEnergyReceived(formData: FormData) { await updateObligation(String(formData.get("id") || ""), "energy"); }
