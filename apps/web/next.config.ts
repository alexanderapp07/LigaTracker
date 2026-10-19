import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Necesario para que el build standalone incluya los paquetes del monorepo.
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  transpilePackages: ["@ligatracker/db", "@ligatracker/domain"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Con pnpm, el trazado del build no detecta el motor de Prisma; se incluye a mano.
  outputFileTracingIncludes: {
    "/**/*": ["../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*"],
  },
};

export default nextConfig;
