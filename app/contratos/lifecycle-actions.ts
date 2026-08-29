"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
function refresh(){revalidatePath("/dashboard");revalidatePath("/contratos");}
export async function markMovingOut(formData:FormData){await requireAdmin();const id=String(formData.get("id")||"");await prisma.contract.update({where:{id},data:{lifecycleStatus:"MOVING_OUT"}});await recordAudit({action:"contract_moving_out",entityType:"Contract",entityId:id,contractId:id,message:"Marcado em desocupação."});refresh();redirect("/dashboard?sucesso=Contrato+marcado+em+desocupação.");}
export async function renewContract(formData:FormData){await requireAdmin();const id=String(formData.get("id")||"");const raw=String(formData.get("endDate")||"");const endDate=new Date(raw+"T12:00:00.000Z");if(Number.isNaN(endDate.getTime()))redirect("/dashboard?erro=Informe+uma+nova+data+de+término.");await prisma.contract.update({where:{id},data:{endDate,lifecycleStatus:"RENEWED"}});await recordAudit({action:"contract_renewed",entityType:"Contract",entityId:id,contractId:id,message:"Contrato renovado."});refresh();redirect("/dashboard?sucesso=Contrato+renovado.");}
