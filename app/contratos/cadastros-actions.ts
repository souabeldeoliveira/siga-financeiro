"use server";

import { Prisma, PropertyStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ownersPath = "/contratos/proprietarios";
const tenantsPath = "/contratos/inquilinos";
const propertiesPath = "/contratos/imoveis";

function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, field: string) {
  return text(formData, field) || null;
}

function requiredText(formData: FormData, field: string, label: string) {
  const value = text(formData, field);
  if (!value) throw new Error(`${label} é obrigatório.`);
  return value;
}

function email(formData: FormData) {
  const value = optionalText(formData, "email");
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error("Informe um e-mail válido.");
  }
  return value;
}

function redirectWith(path: string, kind: "sucesso" | "erro", message: string): never {
  redirect(`${path}?${kind}=${encodeURIComponent(message)}`);
}

function databaseMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return "O cadastro não foi encontrado. Atualize a página e tente novamente.";
  }
  return "Não foi possível salvar o cadastro. Tente novamente.";
}

function parsePerson(formData: FormData) {
  return {
    name: requiredText(formData, "name", "Nome"),
    phone: optionalText(formData, "phone"),
    email: email(formData),
    document: optionalText(formData, "document"),
    notes: optionalText(formData, "notes"),
  };
}

function parseProperty(formData: FormData) {
  const statusValue = text(formData, "status");
  if (!Object.values(PropertyStatus).includes(statusValue as PropertyStatus)) {
    throw new Error("Selecione um status válido para o imóvel.");
  }

  return {
    ownerId: requiredText(formData, "ownerId", "Proprietário"),
    title: requiredText(formData, "title", "Título"),
    address: requiredText(formData, "address", "Endereço"),
    city: optionalText(formData, "city"),
    state: optionalText(formData, "state")?.toUpperCase().slice(0, 2) ?? null,
    status: statusValue as PropertyStatus,
    notes: optionalText(formData, "notes"),
  };
}

export async function createOwner(formData: FormData) {
  await requireAdmin();
  let data: ReturnType<typeof parsePerson>;
  try {
    data = parsePerson(formData);
  } catch (error) {
    redirectWith(ownersPath, "erro", error instanceof Error ? error.message : "Dados inválidos.");
  }

  try {
    await prisma.owner.create({ data });
  } catch (error) {
    redirectWith(ownersPath, "erro", databaseMessage(error));
  }

  revalidatePath(ownersPath);
  redirectWith(ownersPath, "sucesso", "Proprietário cadastrado com sucesso.");
}

export async function updateOwner(id: string, formData: FormData) {
  await requireAdmin();
  let data: ReturnType<typeof parsePerson>;
  try {
    data = parsePerson(formData);
  } catch (error) {
    redirectWith(`${ownersPath}/${id}/editar`, "erro", error instanceof Error ? error.message : "Dados inválidos.");
  }

  try {
    await prisma.owner.update({ where: { id }, data });
  } catch (error) {
    redirectWith(`${ownersPath}/${id}/editar`, "erro", databaseMessage(error));
  }

  revalidatePath(ownersPath);
  redirectWith(ownersPath, "sucesso", "Proprietário atualizado com sucesso.");
}

export async function deleteOwner(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const owner = await prisma.owner.findUnique({
    where: { id },
    select: { _count: { select: { properties: true, contracts: true, transfers: true, annualReports: true } } },
  });

  if (!owner) redirectWith(ownersPath, "erro", "Proprietário não encontrado.");
  if (Object.values(owner._count).some((count) => count > 0)) {
    redirectWith(ownersPath, "erro", "Este proprietário possui vínculos e não pode ser excluído.");
  }

  await prisma.owner.delete({ where: { id } });
  revalidatePath(ownersPath);
  redirectWith(ownersPath, "sucesso", "Proprietário excluído.");
}

export async function createTenant(formData: FormData) {
  await requireAdmin();
  let data: ReturnType<typeof parsePerson>;
  try {
    data = parsePerson(formData);
  } catch (error) {
    redirectWith(tenantsPath, "erro", error instanceof Error ? error.message : "Dados inválidos.");
  }

  try {
    await prisma.tenant.create({ data });
  } catch (error) {
    redirectWith(tenantsPath, "erro", databaseMessage(error));
  }

  revalidatePath(tenantsPath);
  redirectWith(tenantsPath, "sucesso", "Inquilino cadastrado com sucesso.");
}

export async function updateTenant(id: string, formData: FormData) {
  await requireAdmin();
  let data: ReturnType<typeof parsePerson>;
  try {
    data = parsePerson(formData);
  } catch (error) {
    redirectWith(`${tenantsPath}/${id}/editar`, "erro", error instanceof Error ? error.message : "Dados inválidos.");
  }

  try {
    await prisma.tenant.update({ where: { id }, data });
  } catch (error) {
    redirectWith(`${tenantsPath}/${id}/editar`, "erro", databaseMessage(error));
  }

  revalidatePath(tenantsPath);
  redirectWith(tenantsPath, "sucesso", "Inquilino atualizado com sucesso.");
}

export async function deleteTenant(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    select: { _count: { select: { contracts: true } } },
  });

  if (!tenant) redirectWith(tenantsPath, "erro", "Inquilino não encontrado.");
  if (tenant._count.contracts > 0) {
    redirectWith(tenantsPath, "erro", "Este inquilino possui contratos e não pode ser excluído.");
  }

  await prisma.tenant.delete({ where: { id } });
  revalidatePath(tenantsPath);
  redirectWith(tenantsPath, "sucesso", "Inquilino excluído.");
}

export async function createProperty(formData: FormData) {
  await requireAdmin();
  let data: ReturnType<typeof parseProperty>;
  try {
    data = parseProperty(formData);
  } catch (error) {
    redirectWith(propertiesPath, "erro", error instanceof Error ? error.message : "Dados inválidos.");
  }

  try {
    await prisma.property.create({ data });
  } catch (error) {
    redirectWith(propertiesPath, "erro", databaseMessage(error));
  }

  revalidatePath(propertiesPath);
  redirectWith(propertiesPath, "sucesso", "Imóvel cadastrado com sucesso.");
}

export async function updateProperty(id: string, formData: FormData) {
  await requireAdmin();
  let data: ReturnType<typeof parseProperty>;
  try {
    data = parseProperty(formData);
  } catch (error) {
    redirectWith(`${propertiesPath}/${id}/editar`, "erro", error instanceof Error ? error.message : "Dados inválidos.");
  }

  try {
    await prisma.property.update({ where: { id }, data });
  } catch (error) {
    redirectWith(`${propertiesPath}/${id}/editar`, "erro", databaseMessage(error));
  }

  revalidatePath(propertiesPath);
  redirectWith(propertiesPath, "sucesso", "Imóvel atualizado com sucesso.");
}

export async function deleteProperty(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  const property = await prisma.property.findUnique({
    where: { id },
    select: { _count: { select: { contracts: true, iptuRecords: true, annualReports: true } } },
  });

  if (!property) redirectWith(propertiesPath, "erro", "Imóvel não encontrado.");
  if (Object.values(property._count).some((count) => count > 0)) {
    redirectWith(propertiesPath, "erro", "Este imóvel possui vínculos e não pode ser excluído.");
  }

  await prisma.property.delete({ where: { id } });
  revalidatePath(propertiesPath);
  redirectWith(propertiesPath, "sucesso", "Imóvel excluído.");
}
