"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
function refresh(){revalidatePath("/dashboard");revalidatePath("/contratos");}
export async function markMovingOut(formData:FormData){await requireAdmin();const id=String(formData.get("id")||"");await prisma.contract.update({where:{id},data:{lifecycleStatus:"MOVING_OUT"}});await recordAudit({action:"contract_moving_out",entityType:"Contract",entityId:id,contractId:id,message:"Marcado em desocupação."});refresh();redirect("/dashboard?sucesso=Contrato+marcado+em+desocupação.");}
export async function renewContract(formData:FormData){
  await requireAdmin();
  const id=String(formData.get("id")||"");
  const raw=String(formData.get("endDate")||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)) redirect("/dashboard?erro=Informe+uma+nova+data+de+término.");
  const endDate=new Date(raw+"T12:00:00.000Z");
  if(Number.isNaN(endDate.getTime())||endDate.toISOString().slice(0,10)!==raw) redirect("/dashboard?erro=Informe+uma+nova+data+de+término+válida.");
  const contract=await prisma.contract.findUnique({where:{id},select:{endDate:true}});
  if(!contract) redirect("/dashboard?erro=Contrato+não+encontrado.");
  if(endDate<=contract.endDate) redirect("/dashboard?erro=A+nova+data+deve+ser+posterior+ao+término+atual.");
  await prisma.contract.update({where:{id},data:{endDate,lifecycleStatus:"RENEWED"}});
  await recordAudit({action:"contract_renewed",entityType:"Contract",entityId:id,contractId:id,message:"Contrato renovado."});
  refresh();
  redirect("/dashboard?sucesso=Contrato+renovado.");
}
