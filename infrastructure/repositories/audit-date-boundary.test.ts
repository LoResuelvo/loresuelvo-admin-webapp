import { describe, expect, it } from "vitest";
import { toAuditDateBoundary } from "./audit-date-boundary";

describe("Argentina audit date boundaries", () => {
  it("includes the complete local day across a month boundary", () => {
    expect(toAuditDateBoundary("2026-09-30")).toBe("2026-09-30T03:00:00.000Z");
    expect(toAuditDateBoundary("2026-09-30", true)).toBe("2026-10-01T03:00:00.000Z");
  });

  it("preserves explicit instant boundaries and rejects impossible dates", () => {
    expect(toAuditDateBoundary("2026-09-30T04:00:00Z", true)).toBe("2026-09-30T04:00:00.000Z");
    expect(toAuditDateBoundary("2026-02-30")).toBeUndefined();
  });
});
