import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/passwords";
import { seedPermissionsAndRoles } from "../src/seed-data";

const prisma = new PrismaClient();

async function main() {
  await seedPermissionsAndRoles(prisma);

  const email = process.env.SEED_SUPERADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await hashPassword(password);
    await prisma.user.upsert({
      where: { email },
      update: { isSuperAdmin: true },
      create: { email, passwordHash, firstName: "Súper", lastName: "Admin", isSuperAdmin: true },
    });
    console.log(`Súper administrador listo: ${email}`);
  } else {
    console.log("SEED_SUPERADMIN_EMAIL/PASSWORD no definidos: no se creó súper administrador.");
  }
}

main()
  .finally(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
