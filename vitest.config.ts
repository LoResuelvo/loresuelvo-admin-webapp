import path from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const isCI = Boolean(process.env.CI);
const coverageRoot = path.resolve(__dirname).replace(/\\/g, "/");
const coverageExcludedFiles = [
  "infrastructure/i18n/translations.ts",
  "infrastructure/i18n/translations/audit.ts",
  "infrastructure/i18n/translations/auth.ts",
  "infrastructure/i18n/translations/claims.ts",
  "infrastructure/i18n/translations/metrics.ts",
  "infrastructure/i18n/translations/moderation.ts",
  "infrastructure/i18n/translations/navigation.ts",
  "infrastructure/i18n/translations/operations.ts",
  "infrastructure/i18n/translations/payments.ts",
  "infrastructure/i18n/translations/users.ts",
  "components/payments/payment-test-fixtures.ts",
  "infrastructure/repositories/mappers/operation-fixtures.ts",
  "infrastructure/api/e2e-stubs-utils.ts",
  "infrastructure/auth/mock-adapter.ts",
  "infrastructure/repositories/audit-stubs.ts",
  "infrastructure/repositories/claim-stubs.ts",
  "infrastructure/repositories/review-stubs.ts",
].map((file) => `${coverageRoot}/${file}`);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: [
        `${coverageRoot}/{app,components,hooks,lib,domain,ports,application,infrastructure}/**/*.{ts,tsx}`,
        `${coverageRoot}/middleware.ts`,
      ],
      excludeAfterRemap: true,
      exclude: [
        "**/*.{test,spec}.{ts,tsx}",
        "**/*.d.ts",
        "features/**",
        "tools/**",
        ...coverageExcludedFiles,
      ],
    },
    maxWorkers: isCI ? undefined : "25%",
    browser: {
      provider: playwright(),
      instances: [
        { browser: "chromium" },
      ],
    },
    include: [
      "components/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      "domain/**/*.test.{ts,tsx}",
      "application/**/*.test.{ts,tsx}",
      "infrastructure/**/*.test.{ts,tsx}",
      "app/**/*.test.{ts,tsx}",
      "hooks/**/*.test.{ts,tsx}"
    ],
  },
  resolve: {
    alias: { "server-only": path.resolve(__dirname, "node_modules/next/dist/compiled/server-only/empty.js"), "@": path.resolve(__dirname, ".") },
  },
});
