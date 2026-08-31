"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { competenceFromDate } from "@/lib/dates";
import { generateCompetenceForActiveContracts } from "@/lib/obligations";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { isGuaranteeContract } from "@/lib/contracts";
import { nextDiscountInstallments } from "@/lib/discounts";
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
    await prisma.$transaction([
      prisma.monthlyObligation.update({ where: { id }, data: { waterStatus: "COMPLETED", waterProofReceivedAt: now } }),
      prisma.waterRecord.updateMany({ where: { monthlyObligationId: id }, data: { status: "COMPLETED", proofReceivedAt: now } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.monthlyObligation.update({ where: { id }, data: { energyStatus: "COMPLETED", energyProofReceivedAt: now } }),
      prisma.energyRecord.updateMany({ where: { monthlyObligationId: id }, data: { status: "COMPLETED", proofReceivedAt: now } }),
    ]);
  }
  await recordAudit({ action: field + "_proof_received", entityType: "MonthlyObligation", entityId: id, contractId: obligation.contractId, message: "Comprovante registrado." });
  revalidatePath("/essa-semana"); revalidatePath("/cobrancas"); revalidatePath("/dashboard");
  redirectWith("sucesso", "Pendência atualizada.");
}

export async function markRentReceived(formData: FormData) { await updateObligation(String(formData.get("id") || ""), "rent"); }
export async function markWaterReceived(formData: FormData) { await updateObligation(String(formData.get("id") || ""), "water"); }
export async function markEnergyReceived(formData: FormData) { await updateObligation(String(formData.get("id") || ""), "energy"); }
export async function markIptuPaid(formData: FormData) {
  await requireAdmin();
  const id=String(formData.get("id")||"");
  const obligation=await prisma.monthlyObligation.findUnique({where:{id}});
  if(!obligation) redirectWith("erro","Competência não encontrada.");
  const now=new Date();
  await prisma.$transaction(async (tx) => {
    const installments = await tx.iptuInstallment.findMany({
      where: { monthlyObligationId: id, status: "PENDING" },
      select: { id: true, iptuRecordId: true },
    });
    if (installments.length === 0) throw new Error("Nenhuma parcela de IPTU pendente foi encontrada.");

    await tx.iptuInstallment.updateMany({
      where: { id: { in: installments.map((item) => item.id) } },
      data: { status: "PAID", paidAt: now },
    });
    await tx.monthlyObligation.update({ where: { id }, data: { iptuStatus: "COMPLETED" } });

    for (const iptuRecordId of new Set(installments.map((item) => item.iptuRecordId))) {
      const pending = await tx.iptuInstallment.count({ where: { iptuRecordId, status: "PENDING" } });
      await tx.iptuRecord.update({
        where: { id: iptuRecordId },
        data: { status: pending === 0 ? "PAID" : "PARTIALLY_PAID" },
      });
    }
  });
  await recordAudit({action:"iptu_paid",entityType:"MonthlyObligation",entityId:id,contractId:obligation.contractId,message:"IPTU pago."});revalidatePath("/essa-semana");redirectWith("sucesso","IPTU marcado como pago.");
}

async function markTransferProofSent(id: string, field: "rent" | "discount") {
  await requireAdmin();
  const obligation = await prisma.monthlyObligation.findUnique({
    where: { id },
    include: { transfer: true },
  });
  if (!obligation || obligation.transferStatus !== "COMPLETED") {
    redirectWith("erro", "Conclua o repasse antes de registrar o envio de comprovantes.");
  }
  if (field === "discount" && (!obligation.transfer || obligation.transfer.discountAmount.lte(0))) {
    redirectWith("erro", "Este repasse não possui desconto para comprovar.");
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.monthlyObligation.update({
      where: { id },
      data: field === "rent" ? { rentProofSentToOwnerAt: now } : { discountProofSentToOwnerAt: now },
    }),
    prisma.transfer.updateMany({
      where: { monthlyObligationId: id },
      data: field === "rent" ? { rentProofSentToOwnerAt: now } : { discountProofSentToOwnerAt: now },
    }),
  ]);
  await recordAudit({
    action: field === "rent" ? "rent_proof_sent_to_owner" : "discount_proof_sent_to_owner",
    entityType: "MonthlyObligation",
    entityId: id,
    contractId: obligation.contractId,
    message: field === "rent" ? "Comprovante de aluguel enviado ao proprietário." : "Comprovante de desconto enviado ao proprietário.",
  });
  revalidatePath("/essa-semana");
  redirectWith("sucesso", "Comprovante enviado registrado.");
}

export async function markRentProofSentToOwner(formData: FormData) {
  await markTransferProofSent(String(formData.get("id") || ""), "rent");
}

export async function markDiscountProofSentToOwner(formData: FormData) {
  await markTransferProofSent(String(formData.get("id") || ""), "discount");
}

export async function markTransferCompleted(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const obligation = await prisma.monthlyObligation.findUnique({ where: { id }, include: { contract: true } });
  if (!obligation) redirectWith("erro", "Competência não encontrada.");
  if (obligation.transferStatus === "COMPLETED") redirectWith("erro", "Este repasse já foi concluído.");
  const released = obligation.rentStatus === "COMPLETED" || isGuaranteeContract(obligation.contract);
  if (!released) redirectWith("erro", "O repasse só pode ser concluído após o comprovante de aluguel.");
  const installments = await prisma.discountInstallment.findMany({ where: { contractId: obligation.contractId, status: "PENDING" }, orderBy: [{ discount: { createdAt: "asc" } }, { installmentNumber: "asc" }], include: { discount: true } });
  const applicable = nextDiscountInstallments(installments);
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
