import path from "node:path";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
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