import { ContractStatus, GuaranteeType, PaymentType } from "@prisma/client";
import { competenceFromDate, competenceToDate, lastCompetence } from "@/lib/dates";

type ContractCycle = { status: ContractStatus; startDate: Date; endDate: Date; paymentType: PaymentType; guaranteeType: GuaranteeType };

export function isActiveContract(contract: ContractCycle) {
  return contract.status === ContractStatus.ACTIVE;
}

export function isGuaranteeContract(contract: Pick<ContractCycle, "guaranteeType">) {
  return contract.guaranteeType === GuaranteeType.BOOZ
    || contract.guaranteeType === GuaranteeType.LOFT
    || contract.guaranteeType === GuaranteeType.INSURANCE;
}

export function firstApplicableCompetence(contract: Pick<ContractCycle, "startDate" | "paymentType">) {
  const start = competenceFromDate(contract.startDate);
  return contract.paymentType === PaymentType.ARREARS ? competenceFromDate(new Date(Date.UTC(contract.startDate.getUTCFullYear(), contract.startDate.getUTCMonth() + 1, 1, 12))) : start;
}

export function lastApplicableCompetence(contract: Pick<ContractCycle, "endDate" | "paymentType">) {
  return lastCompetence(contract.endDate, contract.paymentType);
}

export function isCompetenceWithinFinancialCycle(contract: ContractCycle, competence: string) {
  if (!isActiveContract(contract)) return false;
  const current = competenceToDate(competence).getTime();
  return current >= competenceToDate(firstApplicableCompetence(contract)).getTime()
    && current <= competenceToDate(lastApplicableCompetence(contract)).getTime();
}
