import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordAudit(input: {
  action: string; entityType: string; entityId?: string; contractId?: string; message?: string; metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({ data: { userId: "local-admin", ...input } });
}
