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
  await prisma.annualReport.create({data:{ownerId,year}});
  revalidatePath("/relatorios");redirect("/relatorios?sucesso=Relatório+criado.");
}
export async function updateReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || ""); const action = String(formData.get("action") || "");
  const data = action === "generate" ? { status: "GENERATED" as const, generatedAt: new Date() } : { status: "SENT" as const, sentAt: new Date() };
  const report = await prisma.annualReport.update({ where: { id }, data });
  await recordAudit({ action: action === "generate" ? "annual_report_generated" : "annual_report_sent", entityType: "AnnualReport", entityId: id, contractId: report.contractId ?? undefined });
  revalidatePath("/relatorios"); redirect("/relatorios?sucesso=Relatório+atualizado.");
}
