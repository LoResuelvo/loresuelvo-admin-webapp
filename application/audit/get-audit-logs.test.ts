import { describe, expect, it, vi } from "vitest";
import type { AuditLogsPage } from "@/domain/audit/audit-log";
import type { AuditRepository } from "@/ports/audit/audit-repository";
import { getAuditLogs } from "./get-audit-logs";

describe("getAuditLogs use case", () => {
  const mockPage: AuditLogsPage = {
    events: [{
      id: "018f3f3a-8e75-7bc4-9a50-8f512998d110",
      occurredOn: "2026-09-28T14:30:00Z",
      operatorId: 101,
      action: "access",
      resourceType: "operation",
      resourceId: "105",
      reason: "Investigación de reporte por posible fraude",
      correlationId: "trace-001",
      result: "succeeded",
    }],
    nextCursor: "next-page",
  };

  it("delegates filters and cursor to AuditRepository", async () => {
    const repository: AuditRepository = {
      getAuditLogs: vi.fn().mockResolvedValue(mockPage),
    };

    const result = await getAuditLogs(
      repository,
      "test-token",
      { action: "access", operatorId: 101 },
      "cursor-value",
    );

    expect(repository.getAuditLogs).toHaveBeenCalledWith(
      "test-token",
      { action: "access", operatorId: 101 },
      "cursor-value",
    );
    expect(result).toEqual(mockPage);
  });

  it("propagates repository errors", async () => {
    const repository: AuditRepository = {
      getAuditLogs: vi.fn().mockRejectedValue(new Error("Network failure")),
    };

    await expect(getAuditLogs(repository, "token")).rejects.toThrow("Network failure");
  });
});
