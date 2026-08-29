import { Prisma } from "@prisma/client";

export type Money = Prisma.Decimal;
export const zeroMoney = new Prisma.Decimal(0);

export function money(value: Prisma.Decimal.Value): Money {
  return new Prisma.Decimal(value);
}

export function formatMoney(value: Prisma.Decimal.Value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(money(value).toFixed(2)));
}

export function percentageOf(value: Prisma.Decimal.Value, percent: Prisma.Decimal.Value) {
  return money(value).mul(money(percent)).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function subtractMoney(value: Prisma.Decimal.Value, ...deductions: Prisma.Decimal.Value[]) {
  return deductions.reduce<Money>((total, deduction) => total.minus(money(deduction)), money(value)).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}
