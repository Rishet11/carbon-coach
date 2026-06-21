import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
  {
    // Quality guardrails enforced across all source code.
    // Flat control flow + type-safe boundaries keep the "time-to-fix" low.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      complexity: ["error", 8],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
  {
    // Tests assert on real behaviour and are allowed slightly longer flows.
    files: ["src/**/__tests__/**/*.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    rules: {
      complexity: "off",
      "max-depth": "off",
      "no-console": "off",
    },
  },
]);

export default eslintConfig;
