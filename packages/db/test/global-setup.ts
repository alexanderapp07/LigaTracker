import { execSync } from "node:child_process";

export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("Define TEST_DATABASE_URL para los tests de integración");
  // Los tests vacían todas las tablas: nunca deben apuntar a una base real.
  if (!new URL(url).pathname.endsWith("_test")) {
    throw new Error("TEST_DATABASE_URL debe apuntar a una base cuyo nombre termine en _test");
  }
  execSync("prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
}
