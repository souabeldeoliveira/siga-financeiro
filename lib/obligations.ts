import { CemigHolder, ObligationStatus } from "@prisma/client";
import { isCompetenceWithinFinancialCycle } from "@/lib/contracts";
import { dueDateForCompetence } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function generateMonthlyObligation(contractId: string, competence: string) {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) throw new Error("Contrato não encontrado.");
  if (!isCompetenceWithinFinancialCycle(contract, competence)) return null;

  return prisma.monthlyObligation.upsert({
    where: { contractId_competence: { contractId, competence } },
    create: {
      contractId,
      competence,
      dueDate: dueDateForCompetence(competence, contract.dueDay),
      rentStatus: ObligationStatus.PENDING,
      waterStatus: ObligationStatus.PENDING,
      energyStatus: contract.cemigHolder === CemigHolder.OWNER ? ObligationStatus.PENDING : ObligationStatus.NOT_APPLICABLE,
    },
    update: {},
  });
}

export async function generateCompetenceForActiveContracts(competence: string) {
  const contracts = await prisma.contract.findMany({ where: { status: "ACTIVE" }, select: { id: true } });
  const results = await Promise.all(contracts.map((contract) => generateMonthlyObligation(contract.id, competence)));
  return results.filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function obligationWithContext(id: string) {
  return prisma.monthlyObligation.findUnique({
    where: { id },
    include: { contract: { include: { owner: true, tenant: true, property: true } } },
  });
}
