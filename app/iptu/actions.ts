"use server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
export async function createIptu(formData: FormData) {
  await requireAdmin();
  try {
    const propertyId=String(formData.get("propertyId")||""); const year=Number(formData.get("year")); const total=new Prisma.Decimal(String(formData.get("amount")||"0").replace(",","."));
    const installments=Number(formData.get("installmentCount")||1); const type=installments>1?"INSTALLMENT":"SINGLE";
    if(!propertyId||!Number.isInteger(year)||total.lte(0)||!Number.isInteger(installments)||installments<1) throw new Error("Dados de IPTU inválidos.");
    const record=await prisma.iptuRecord.create({data:{propertyId,year,type,totalAmount:total,responsibility:String(formData.get("responsibility"))==="TENANT"?"TENANT":"OWNER",installmentCount:installments,installments:{create:Array.from({length:installments},(_,i)=>({installmentNumber:i+1,totalInstallments:installments,amount:total.div(installments).toDecimalPlaces(2),dueDate:new Date(Date.UTC(year,i+2,10,12))}))}}});
    await recordAudit({action:"iptu_created",entityType:"IptuRecord",entityId:record.id,message:"IPTU cadastrado."}); revalidatePath("/iptu");redirect("/iptu?sucesso=IPTU+cadastrado.");
  }catch(e){redirect("/iptu?erro="+encodeURIComponent(e instanceof Error?e.message:"Erro ao cadastrar IPTU."));}
}
