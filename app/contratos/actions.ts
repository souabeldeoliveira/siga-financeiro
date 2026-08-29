"use server";

import {
  AdministrationFeeType, CemigHolder, ContractLifecycleStatus, ContractStatus,
  GuaranteeType, IntermediationFeeType, IptuResponsibility, PaymentType, Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const contractsPath = "/contratos";
function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
function requiredText(formData: FormData, field: string, label: string) {
  const value = text(formData, field);
  if (!value) throw new Error(label + " é obrigatório.");
  return value;
}
function enumValue<T extends string>(formData: FormData, field: string, values: readonly T[], label: string) {
  const value = text(formData, field) as T;
  if (!values.includes(value)) throw new Error("Selecione uma opção válida para " + label + ".");
  return value;
}
function dateValue(formData: FormData, field: string, label: string) {
  const value = requiredText(formData, field, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(label + " é inválida.");
  const date = new Date(value + "T12:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(label + " é inválida.");
  return date;
}
function moneyValue(formData: FormData) {
  const value = requiredText(formData, "rentAmount", "Valor do aluguel").replace(/\s|R\$/gi, "");
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error("Informe um valor de aluguel válido.");
  const amount = new Prisma.Decimal(normalized);
  if (amount.lte(0)) throw new Error("O valor do aluguel deve ser maior que zero.");
  return amount;
}
function redirectWith(path: string, kind: "sucesso" | "erro", message: string): never {
  redirect(path + "?" + kind + "=" + encodeURIComponent(message));
}
function databaseMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "O contrato não foi encontrado. Atualize a página e tente novamente.";
  }
  return "Não foi possível salvar o contrato. Tente novamente.";
}
function parseContract(formData: FormData) {
  const startDate = dateValue(formData, "startDate", "Data de início");
  const endDate = dateValue(formData, "endDate", "Data de término");
  if (endDate < startDate) throw new Error("A data de término deve ser posterior à data de início.");
  const dueDay = Number(requiredText(formData, "dueDay", "Dia de vencimento"));
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) throw new Error("O dia de vencimento deve estar entre 1 e 31.");
  const administrationFeeType = enumValue(formData, "administrationFeeType", Object.values(AdministrationFeeType), "taxa de administração");
  const intermediationFeeType = enumValue(formData, "intermediationFeeType", Object.values(IntermediationFeeType), "taxa de intermediação");
  return {
    ownerId: requiredText(formData, "ownerId", "Proprietário"),
    tenantId: requiredText(formData, "tenantId", "Inquilino"),
    propertyId: requiredText(formData, "propertyId", "Imóvel"),
    rentAmount: moneyValue(formData), startDate, endDate, dueDay,
    paymentType: enumValue(formData, "paymentType", Object.values(PaymentType), "tipo de pagamento"),
    guaranteeType: enumValue(formData, "guaranteeType", Object.values(GuaranteeType), "garantia"),
    iptuResponsibility: enumValue(formData, "iptuResponsibility", Object.values(IptuResponsibility), "responsável pelo IPTU"),
    cemigHolder: enumValue(formData, "cemigHolder", Object.values(CemigHolder), "titularidade da CEMIG"),
    administrationFeeType,
    administrationFeePercent: new Prisma.Decimal(administrationFeeType === "SEASONAL_20" ? 20 : 10),
    intermediationFeeType,
    intermediationFeePercent: new Prisma.Decimal(intermediationFeeType === "FIFTY_AFTER_THREE_MONTHS" ? 50 : 0),
    status: enumValue(formData, "status", Object.values(ContractStatus), "status"),
    lifecycleStatus: enumValue(formData, "lifecycleStatus", Object.values(ContractLifecycleStatus), "situação do contrato"),
    notes: text(formData, "notes") || null,
  };
}
async function validateRelations(data: ReturnType<typeof parseContract>, currentId?: string) {
  const [property, tenant] = await Promise.all([
    prisma.property.findUnique({ where: { id: data.propertyId }, select: { ownerId: true } }),
    prisma.tenant.findUnique({ where: { id: data.tenantId }, select: { id: true } }),
  ]);
  if (!property || property.ownerId !== data.ownerId) throw new Error("O imóvel selecionado não pertence ao proprietário informado.");
  if (!tenant) throw new Error("O inquilino selecionado não foi encontrado.");
  if (data.status === ContractStatus.ACTIVE) {
    const existing = await prisma.contract.findFirst({
      where: { propertyId: data.propertyId, status: ContractStatus.ACTIVE, id: currentId ? { not: currentId } : undefined },
      select: { id: true },
    });
    if (existing) throw new Error("Este imóvel já possui um contrato ativo.");
  }
}
export async function createContract(formData: FormData) {
  await requireAdmin();
  try {
    const data = parseContract(formData);
    await validateRelations(data);
    await prisma.contract.create({ data });
  } catch (error) {
    redirectWith(contractsPath + "/novo", "erro", error instanceof Error ? error.message : databaseMessage(error));
  }
  revalidatePath(contractsPath);
  redirectWith(contractsPath, "sucesso", "Contrato cadastrado com sucesso.");
}
export async function updateContract(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const data = parseContract(formData);
    await validateRelations(data, id);
    await prisma.contract.update({ where: { id }, data });
  } catch (error) {
    redirectWith(contractsPath + "/" + id + "/editar", "erro", error instanceof Error ? error.message : databaseMessage(error));
  }
  revalidatePath(contractsPath);
  revalidatePath(contractsPath + "/" + id);
  redirectWith(contractsPath + "/" + id, "sucesso", "Contrato atualizado com sucesso.");
}
export async function deleteContract(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { _count: { select: {
      monthlyObligations: true, paymentProofs: true, charges: true, transfers: true,
      discounts: true, iptuRecords: true, waterRecords: true, energyRecords: true,
      annualReports: true, auditLogs: true,
    } } },
  });
  if (!contract) redirectWith(contractsPath, "erro", "Contrato não encontrado.");
  if (Object.values(contract._count).some((count) => count > 0)) {
    redirectWith(contractsPath, "erro", "Este contrato já possui histórico e não pode ser excluído. Marque-o como encerrado.");
  }
  await prisma.contract.delete({ where: { id } });
  revalidatePath(contractsPath);
  redirectWith(contractsPath, "sucesso", "Contrato excluído.");
}
