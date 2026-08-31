"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
export async function createReport(formData: FormData) {
  await requireAdmin();
  const ownerId=String(formData.get("ownerId")||""); const year=Number(formData.get("year"));
  if(!ownerId||!Number.isInteger(year)) redirect("/relatorios?erro=Informe+proprietário+e+ano.");
  const [owner, existing] = await Promise.all([
    prisma.owner.findUnique({ where: { id: ownerId }, select: { id: true } }),
    prisma.annualReport.findFirst({ where: { ownerId, year }, select: { id: true } }),
  ]);
  if (!owner) redirect("/relatorios?erro=Proprietário+não+encontrado.");
  if (existing) redirect("/relatorios?erro=Já+existe+um+relatório+para+este+proprietário+e+ano.");
  const report = await prisma.annualReport.create({data:{ownerId,year}});
  await recordAudit({ action: "annual_report_created", entityType: "AnnualReport", entityId: report.id, message: "Relatório anual criado." });
  revalidatePath("/relatorios");redirect("/relatorios?sucesso=Relatório+criado.");
}
export async function updateReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || ""); const action = String(formData.get("action") || "");
  if (action !== "generate" && action !== "send") redirect("/relatorios?erro=Ação+de+relatório+inválida.");
  const current = await prisma.annualReport.findUnique({ where: { id }, select: { status: true } });
  if (!current) redirect("/relatorios?erro=Relatório+não+encontrado.");
  if ((action === "generate" && current.status !== "NOT_GENERATED") || (action === "send" && current.status !== "GENERATED")) {
    redirect("/relatorios?erro=Esta+alteração+de+status+não+é+permitida.");
  }
  const data = action === "generate" ? { status: "GENERATED" as const, generatedAt: new Date() } : { status: "SENT" as const, sentAt: new Date() };
  const report = await prisma.annualReport.update({ where: { id }, data });
  await recordAudit({ action: action === "generate" ? "annual_report_generated" : "annual_report_sent", entityType: "AnnualReport", entityId: id, contractId: report.contractId ?? undefined });
  revalidatePath("/relatorios"); redirect("/relatorios?sucesso=Relatório+atualizado.");
}
