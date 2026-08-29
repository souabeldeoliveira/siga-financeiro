import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();
  const [owners, tenants, properties, contracts, obligations, proofs, charges, transfers, discounts, iptu, reports, auditLogs] = await Promise.all([
    prisma.owner.findMany(), prisma.tenant.findMany(), prisma.property.findMany(), prisma.contract.findMany(),
    prisma.monthlyObligation.findMany(), prisma.paymentProof.findMany(), prisma.charge.findMany(), prisma.transfer.findMany(),
    prisma.discount.findMany({ include: { installments: true } }), prisma.iptuRecord.findMany({ include: { installments: true } }),
    prisma.annualReport.findMany(), prisma.auditLog.findMany(),
  ]);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), owners, tenants, properties, contracts, obligations, proofs, charges, transfers, discounts, iptu, reports, auditLogs }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": "attachment; filename=siga-financeiro-backup.json" },
  });
}
