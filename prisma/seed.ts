import { PrismaClient, UserRole } from "@prisma/client";

process.loadEnvFile();

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "mariana@siga.local" },
    update: { name: "Mariana", role: UserRole.ADMIN },
    create: {
      id: "local-admin",
      name: "Mariana",
      email: "mariana@siga.local",
      role: UserRole.ADMIN,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
