import { PaymentType } from "@prisma/client";

export function dateAtNoon(value: Date | string) {
  const source = typeof value === "string" ? new Date(value + "T12:00:00.000Z") : value;
  return new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), source.getUTCDate(), 12));
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(value);
}

export function competenceFromDate(value: Date) {
  return value.getUTCFullYear() + "-" + String(value.getUTCMonth() + 1).padStart(2, "0");
}

export function competenceToDate(competence: string) {
  if (!/^\d{4}-\d{2}$/.test(competence)) throw new Error("Competência inválida.");
  const [year, month] = competence.split("-").map(Number);
  if (month < 1 || month > 12) throw new Error("Competência inválida.");
  return new Date(Date.UTC(year, month - 1, 1, 12));
}

export function addMonths(value: Date, amount: number) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + amount, 1, 12));
}

export function dueDateForCompetence(competence: string, dueDay: number) {
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) throw new Error("Dia de vencimento inválido.");
  const firstDay = competenceToDate(competence);
  const finalDay = new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() + 1, 0, 12)).getUTCDate();
  return new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), Math.min(dueDay, finalDay), 12));
}

export function lastCompetence(endDate: Date, paymentType: PaymentType) {
  const end = dateAtNoon(endDate);
  return competenceFromDate(paymentType === PaymentType.ARREARS ? addMonths(end, 1) : end);
}

export function isAtLeastDaysAfter(dueDate: Date, days: number, today = new Date()) {
  const difference = dateAtNoon(today).getTime() - dateAtNoon(dueDate).getTime();
  return difference >= days * 86400000;
}

export function daysUntil(value: Date, today = new Date()) {
  return Math.ceil((dateAtNoon(value).getTime() - dateAtNoon(today).getTime()) / 86400000);
}
