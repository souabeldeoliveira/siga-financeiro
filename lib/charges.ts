import { ChargeStage } from "@prisma/client";
import { isAtLeastDaysAfter } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const stages: Array<[number, ChargeStage]> = [
  [30, ChargeStage.D30], [20, ChargeStage.D20], [15, ChargeStage.D15],
  [10, ChargeStage.D10], [7, ChargeStage.D7], [5, ChargeStage.D5],
];

export function chargeStageForDueDate(dueDate: Date, today = new Date()) {
  if (!isAtLeastDaysAfter(dueDate, 5, today)) return null;
  const elapsed = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);
  return stages.find(([days]) => elapsed >= days)?.[1] ?? ChargeStage.D5;
}

export async function synchronizeCharges(today = new Date()) {
  const obligations = await prisma.monthlyObligation.findMany({
    where: { rentStatus: "PENDING", dueDate: { lte: today }, contract: { status: "ACTIVE" } },
    include: { contract: true },
  });
  let total = 0;
  for (const obligation of obligations) {
    const stage = chargeStageForDueDate(obligation.dueDate, today);
    if (!stage) continue;
    await prisma.$transaction([
      prisma.charge.upsert({
        where: { monthlyObligationId: obligation.id },
        create: { contractId: obligation.contractId, monthlyObligationId: obligation.id, stage },
        update: { stage, status: "OPEN" },
      }),
      prisma.monthlyObligation.update({ where: { id: obligation.id }, data: { chargeStatus: stage } }),
    ]);
    total += 1;
  }
  return total;
}
