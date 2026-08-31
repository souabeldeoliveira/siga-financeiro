import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function nextDiscountInstallments<T extends { discountId: string }>(installments: T[]) {
  return installments.filter((item, index, all) => all.findIndex((other) => other.discountId === item.discountId) === index);
}

export async function createDiscount(input: { contractId: string; type: "REPAIR" | "BILL" | "OTHER"; description: string; totalAmount: Prisma.Decimal; installmentCount: number; notes?: string | null }) {
  const contract = await prisma.contract.findFirst({ where: { id: input.contractId, status: "ACTIVE" }, select: { id: true } });
  if (!contract) throw new Error("Selecione um contrato ativo.");
  const installmentAmount = input.totalAmount.div(input.installmentCount).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  return prisma.discount.create({
    data: {
      contractId: input.contractId, type: input.type, description: input.description, totalAmount: input.totalAmount,
      installmentCount: input.installmentCount, installmentAmount, notes: input.notes ?? null,
      installments: { create: Array.from({ length: input.installmentCount }, (_, index) => ({
        contractId: input.contractId, installmentNumber: index + 1, totalInstallments: input.installmentCount,
        amount: index === input.installmentCount - 1 ? input.totalAmount.minus(installmentAmount.mul(input.installmentCount - 1)) : installmentAmount,
      })) },
    },
  });
}
