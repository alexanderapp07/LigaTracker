import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });

export async function resetData() {
  const tables = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(", ");
  await db.$executeRawUnsafe(`TRUNCATE ${list} CASCADE`);
}
