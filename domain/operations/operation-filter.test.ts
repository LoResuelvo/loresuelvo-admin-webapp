import { describe, expect, it } from "vitest";
import { hasPendingAdvanceOver24Hours } from "./operation-filter";
import type { OperationSummary } from "./operation-summary";

const now = Date.parse("2026-09-29T12:00:00Z");
const operation: OperationSummary = {
  id: "jr-1",
  consumer: { id: 1, name: "Ana", surname: "Pérez" },
  provider: { id: 2, name: "Luis", surname: "Sosa" },
  category: null,
  status: "request_pending",
  nextActionBy: "provider",
  createdAt: "2026-09-28T12:00:00Z",
  updatedAt: "2026-09-28T12:00:00Z",
};

describe("pending business advance filter", () => {
  it("excludes exactly 24 hours and includes strictly older advances", () => {
    expect(hasPendingAdvanceOver24Hours(operation, now)).toBe(false);
    expect(hasPendingAdvanceOver24Hours(operation, now + 1)).toBe(true);
  });
  it("never infers the age of an unavailable advance", () => {
    expect(hasPendingAdvanceOver24Hours({ ...operation, updatedAt: null }, now)).toBe(false);
  });
  it("excludes paid and accepted operations even when their evidence is old", () => {
    for (const status of ["work_order_paid", "request_accepted"] as const) {
      expect(hasPendingAdvanceOver24Hours({ ...operation, status }, now + 1)).toBe(false);
    }
  });
});
