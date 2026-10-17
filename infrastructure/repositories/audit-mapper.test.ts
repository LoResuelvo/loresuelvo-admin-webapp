import { describe, expect, it } from "vitest";
import { mapAuditLogEntry, mapAuditLogsPage } from "./audit-mapper";
import type { ApiAuditLogEntry } from "@/infrastructure/api/audit-types";

describe("audit-mapper", () => {
  const sampleDto: ApiAuditLogEntry = {
    id: "018f3f3a-8e75-7bc4-9a50-8f512998d110",
    operator_id: 101,
    action: "access",
    resource_type: "operation",
    resource_id: "105",
    occurred_on: "2026-09-28T14:30:00Z",
    result: "succeeded",
    correlation_id: "trace-001",
    reason: "Investigación de reporte por posible fraude",
  };

  it("maps a single API event to the domain model without adding absent fields", () => {
    const domain = mapAuditLogEntry(sampleDto);

    expect(domain).toEqual({
      id: sampleDto.id,
      operatorId: 101,
      action: "access",
      resourceType: "operation",
      resourceId: "105",
      occurredOn: "2026-09-28T14:30:00Z",
      result: "succeeded",
      correlationId: "trace-001",
      reason: "Investigación de reporte por posible fraude",
    });
    expect(domain).not.toHaveProperty("operatorEmail");
    expect(domain).not.toHaveProperty("ipAddress");
  });

  it("maps a page and preserves its next cursor", () => {
    const page = mapAuditLogsPage({ events: [sampleDto], next_cursor: "next-page" });

    expect(page.events).toHaveLength(1);
    expect(page.events[0].id).toBe(sampleDto.id);
    expect(page.nextCursor).toBe("next-page");
  });

  it("maps a missing cursor as the end of the page sequence", () => {
    expect(mapAuditLogsPage({ events: [sampleDto], next_cursor: null }).nextCursor).toBeNull();
  });

  it("throws error for invalid DTO payload", () => {
    expect(() => mapAuditLogsPage({ invalid: true })).toThrow("Invalid audit logs response");
  });
});
