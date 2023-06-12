import { fileURLToPath } from "url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude],
    alias: {
      "~/": fileURLToPath(new URL("./src/", import.meta.url)),
    },
    coverage: {
      include: ["src/server/api/root.ts"],
      reporter: ['text', 'json-summary', 'json'],
    },
  },
});
