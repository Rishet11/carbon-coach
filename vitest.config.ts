import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/domain/**/*.ts", "src/lib/**/*.ts", "src/app/api/**/*.ts", "src/app/components/**/*.tsx"],
      exclude: ["src/domain/types.ts", "src/domain/emission-factors.ts", "src/domain/sample-profiles.ts"],
    },
  },
});
