import { Contract, GuaranteeType, Prisma } from "@prisma/client";
import { firstApplicableCompetence, isGuaranteeContract } from "@/lib/contracts";
import { money, percentageOf, subtractMoney, zeroMoney } from "@/lib/money";

export type TransferCalculation = {
  grossRentAmount: Prisma.Decimal;
  administrationFeeAmount: Prisma.Decimal;
  intermediationFeeAmount: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  netTransferAmount: Prisma.Decimal;
  isReleasedByGuarantee: boolean;
  guaranteeType: GuaranteeType | null;
};

export function calculateTransfer(contract: Contract, competence: string, discounts: Prisma.Decimal.Value[] = []): TransferCalculation {
  const grossRentAmount = money(contract.rentAmount);
  const isIntermediationCompetence = competence === firstApplicableCompetence(contract) && contract.intermediationFeePercent.gt(0);
  const administrationFeeAmount = isIntermediationCompetence ? zeroMoney : percentageOf(grossRentAmount, contract.administrationFeePercent);
  const intermediationFeeAmount = isIntermediationCompetence ? percentageOf(grossRentAmount, contract.intermediationFeePercent) : zeroMoney;
  const discountAmount = discounts.reduce<Prisma.Decimal>((total, value) => total.plus(money(value)), zeroMoney);
  return {
    grossRentAmount,
    administrationFeeAmount,
    intermediationFeeAmount,
    discountAmount,
    netTransferAmount: subtractMoney(grossRentAmount, administrationFeeAmount, intermediationFeeAmount, discountAmount),
    isReleasedByGuarantee: isGuaranteeContract(contract),
    guaranteeType: isGuaranteeContract(contract) ? contract.guaranteeType : null,
  };
}
