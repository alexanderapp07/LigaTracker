import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./test/global-setup.ts"],
    // Los tests comparten una sola base de datos.
    fileParallelism: false,
  },
});
