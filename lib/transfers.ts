import { Contract, DiscountType, GuaranteeType, Prisma, Transfer } from "@prisma/client";
import { firstApplicableCompetence, isGuaranteeContract } from "@/lib/contracts";
import { formatMoney, money, percentageOf, subtractMoney, zeroMoney } from "@/lib/money";

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

type OwnerTransferMessageInput = {
  ownerName: string;
  propertyTitle: string;
  tenantName: string;
  transfer: Transfer;
  discountInstallments: Array<{ installmentNumber: number; totalInstallments: number; amount: Prisma.Decimal; discount: { type: DiscountType; description: string } }>;
};

const discountTypeLabel: Record<DiscountType, string> = {
  REPAIR: "Reparo",
  BILL: "Conta",
  OTHER: "Outro",
};

export function ownerTransferMessage(input: OwnerTransferMessageInput) {
  const { transfer } = input;
  const feeIsIntermediation = transfer.intermediationFeeAmount.gt(0);
  const feeLabel = feeIsIntermediation ? "Taxa de intermediação" : "Taxa de administração";
  const feeAmount = feeIsIntermediation ? transfer.intermediationFeeAmount : transfer.administrationFeeAmount;
  const transferredAt = transfer.transferredAt
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(transfer.transferredAt)
    : "não informada";
  const guaranteeMessage = transfer.isReleasedByGuarantee && transfer.guaranteeType
    ? "Repasse liberado pela fiança " + ({ BOOZ: "Booz", LOFT: "Loft", INSURANCE: "seguro-fiança", CAUTION: "caução" } as Record<GuaranteeType, string>)[transfer.guaranteeType] + "."
    : null;
  const discounts = input.discountInstallments.map((item) =>
    "Desconto — " + discountTypeLabel[item.discount.type] + ": " + item.discount.description
      + " (parcela " + item.installmentNumber + "/" + item.totalInstallments + "): -" + formatMoney(item.amount),
  );
  const proofs = [
    transfer.rentProofSentToOwnerAt ? "Comprovante do aluguel enviado ao proprietário." : "Comprovante do aluguel pendente de envio ao proprietário.",
    transfer.discountAmount.gt(0) && (transfer.discountProofSentToOwnerAt ? "Comprovante do desconto enviado ao proprietário." : "Comprovante do desconto pendente de envio ao proprietário."),
  ].filter(Boolean);

  return [
    "Olá, " + input.ownerName + ". Tudo bem?",
    "Segue o resumo do repasse referente ao imóvel " + input.propertyTitle + ", locado para " + input.tenantName + ".",
    "Aluguel: " + formatMoney(transfer.grossRentAmount),
    feeLabel + ": -" + formatMoney(feeAmount),
    ...discounts,
    "Valor repassado: " + formatMoney(transfer.netTransferAmount),
    "Data do repasse: " + transferredAt + ".",
    guaranteeMessage,
    ...proofs,
  ].filter(Boolean).join("\n");
}
