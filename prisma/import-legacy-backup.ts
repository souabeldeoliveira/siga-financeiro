import { PrismaClient, type GuaranteeType, type IptuResponsibility } from "@prisma/client";
import { readFile } from "node:fs/promises";

type LegacyContract = {
  id: string;
  proprietario: string;
  telefoneProprietario?: string;
  inquilino: string;
  telefoneInquilino?: string;
  imovel: string;
  endereco: string;
  valorAluguel: number;
  diaVencimento: number;
  garantia?: string;
  caucao?: string;
  booz?: string;
  responsavelIptu?: string;
  status?: string;
  observacoes?: string;
  createdAt?: string;
};

type LegacyBackup = { contracts?: LegacyContract[] };

const prisma = new PrismaClient();
const normalize = (value: string | undefined) => value?.trim() || undefined;

function parseEndDate(notes: string | undefined, fallback: Date) {
  const match = notes?.match(/(?:vence|finaliza)\s+(\d{2})\/(\d{2})\/(\d{4})/i);
  if (match === null || match === undefined) return fallback;

  const [, day, month, year] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function resolveGuarantee(guarantee: string | undefined): GuaranteeType {
  const value = normalize(guarantee)?.toLocaleLowerCase("pt-BR") ?? "";
  if (value.includes("booz")) return "BOOZ";
  if (value.includes("loft")) return "LOFT";
  if (value.includes("seguro")) return "INSURANCE";
  return "CAUTION";
}

function resolveIptuResponsibility(value: string | undefined): IptuResponsibility {
  return normalize(value)?.toLocaleLowerCase("pt-BR") === "inquilino" ? "TENANT" : "OWNER";
}

function buildNotes(contract: LegacyContract) {
  return [
    normalize(contract.observacoes),
    normalize(contract.caucao) && "Caução informada no backup: " + normalize(contract.caucao),
    normalize(contract.booz) && "Booz informado no backup: " + normalize(contract.booz),
    "Importação do backup legado: " + contract.id,
  ].filter(Boolean).join("\n");
}

async function importContract(contract: LegacyContract) {
  const importMarker = "Importação do backup legado: " + contract.id;
  const alreadyImported = await prisma.contract.findFirst({
    where: { notes: { contains: importMarker } },
    select: { id: true },
  });
  if (alreadyImported) return "skipped";

  const ownerName = normalize(contract.proprietario);
  const tenantName = normalize(contract.inquilino);
  const propertyTitle = normalize(contract.imovel);
  const address = normalize(contract.endereco);
  if (!ownerName || !tenantName || !propertyTitle || !address) {
    throw new Error("Contrato " + contract.id + " não possui os dados mínimos para importação.");
  }

  const createdAt = contract.createdAt ? new Date(contract.createdAt) : new Date();
  const endDate = parseEndDate(contract.observacoes, createdAt);
  const notes = buildNotes(contract);

  await prisma.$transaction(async (tx) => {
    const owner = (await tx.owner.findFirst({
      where: { name: ownerName, phone: normalize(contract.telefoneProprietario) },
    })) ?? await tx.owner.create({ data: { name: ownerName, phone: normalize(contract.telefoneProprietario) } });
    const tenant = (await tx.tenant.findFirst({
      where: { name: tenantName, phone: normalize(contract.telefoneInquilino) },
    })) ?? await tx.tenant.create({ data: { name: tenantName, phone: normalize(contract.telefoneInquilino) } });
    const property = (await tx.property.findFirst({
      where: { ownerId: owner.id, title: propertyTitle, address },
    })) ?? await tx.property.create({ data: {
      ownerId: owner.id,
      title: propertyTitle,
      address,
      status: normalize(contract.status)?.toLocaleLowerCase("pt-BR") === "ativo" ? "OCCUPIED" : "VACANT",
    } });

    await tx.contract.create({ data: {
      ownerId: owner.id,
      tenantId: tenant.id,
      propertyId: property.id,
      rentAmount: contract.valorAluguel,
      dueDay: contract.diaVencimento,
      startDate: createdAt,
      endDate,
      guaranteeType: resolveGuarantee(contract.garantia),
      iptuResponsibility: resolveIptuResponsibility(contract.responsavelIptu),
      status: normalize(contract.status)?.toLocaleLowerCase("pt-BR") === "ativo" ? "ACTIVE" : "VACANT",
      notes,
      createdAt,
    } });
  });

  return "imported";
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) throw new Error("Informe o caminho do arquivo de backup JSON.");

  const backup = JSON.parse(await readFile(filePath, "utf8")) as LegacyBackup;
  let imported = 0;
  let skipped = 0;
  for (const contract of backup.contracts ?? []) {
    if (await importContract(contract) === "imported") imported += 1;
    else skipped += 1;
  }
  console.log("Importação concluída: " + imported + " contrato(s) importado(s), " + skipped + " já existente(s).");
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
