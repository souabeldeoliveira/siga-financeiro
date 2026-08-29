"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { competenceFromDate } from "@/lib/dates";
import { generateCompetenceForActiveContracts } from "@/lib/obligations";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { calculateTransfer } from "@/lib/transfers";

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

export async function markTransferCompleted(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const obligation = await prisma.monthlyObligation.findUnique({ where: { id }, include: { contract: true } });
  if (!obligation) redirectWith("erro", "Competência não encontrada.");
  const released = obligation.rentStatus === "COMPLETED" || obligation.contract.guaranteeType === "BOOZ" || obligation.contract.guaranteeType === "LOFT";
  if (!released) redirectWith("erro", "O repasse só pode ser concluído após o comprovante de aluguel.");
  const installments = await prisma.discountInstallment.findMany({ where: { contractId: obligation.contractId, status: "PENDING" }, orderBy: [{ discount: { createdAt: "asc" } }, { installmentNumber: "asc" }], include: { discount: true } });
  const applicable = installments.filter((item, index, all) => all.findIndex(other => other.discountId === item.discountId) === index);
  const calculation = calculateTransfer(obligation.contract, obligation.competence, applicable.map(item => item.amount));
  const now = new Date();
  await prisma.$transaction([
    prisma.transfer.upsert({
      where: { monthlyObligationId: id },
      create: { contractId: obligation.contractId, monthlyObligationId: id, ownerId: obligation.contract.ownerId, ...calculation, status: "COMPLETED", transferredAt: now },
      update: { ...calculation, status: "COMPLETED", transferredAt: now },
    }),
    prisma.monthlyObligation.update({ where: { id }, data: { transferStatus: "COMPLETED" } }),
    prisma.discountInstallment.updateMany({ where: { id: { in: applicable.map(item => item.id) } }, data: { status: "APPLIED", monthlyObligationId: id, appliedAt: now } }),
  ]);
  await recordAudit({ action: "transfer_completed", entityType: "Transfer", entityId: id, contractId: obligation.contractId, message: "Repasse concluído.", metadata: { amount: calculation.netTransferAmount.toString() } });
  revalidatePath("/essa-semana"); revalidatePath("/dashboard");
  redirectWith("sucesso", "Repasse concluído.");
}
