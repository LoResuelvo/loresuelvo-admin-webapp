import { describe, expect, it, vi, beforeEach } from "vitest";
import type { AuditLogsPage } from "@/domain/audit/audit-log";
import { AuditError } from "@/domain/audit/audit-error";
import { translations } from "@/infrastructure/i18n/translations";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

const mockAuditLogsPage: AuditLogsPage = {
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

vi.mock("@/infrastructure/repositories/api-audit-repository", () => ({
  apiAuditRepository: {
    getAuditLogs: vi.fn(),
  },
}));

import { apiAuditRepository } from "@/infrastructure/repositories/api-audit-repository";
import { getAuditLogsAction } from "@/app/(dashboard)/auditoria/actions";

describe("getAuditLogsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an audit page and forwards filters and cursor", async () => {
    vi.mocked(apiAuditRepository.getAuditLogs).mockResolvedValue(mockAuditLogsPage);

    const result = await getAuditLogsAction({ action: "access", operatorId: 101 }, "cursor-value");

    expect(result).toEqual({ success: true, data: mockAuditLogsPage });
    expect(apiAuditRepository.getAuditLogs).toHaveBeenCalledWith(
      "mock-jwt-token",
      { action: "access", operatorId: 101 },
      "cursor-value",
    );
  });

  it("handles forbidden error gracefully", async () => {
    vi.mocked(apiAuditRepository.getAuditLogs).mockRejectedValue(
      new AuditError("forbidden", "Forbidden"),
    );

    const result = await getAuditLogsAction();

    expect(result).toEqual({
      success: false,
      error: "No posees permisos suficientes para acceder a la consola de auditoría.",
      isForbidden: true,
    });
  });

  it("handles generic or unavailable error gracefully", async () => {
    vi.mocked(apiAuditRepository.getAuditLogs).mockRejectedValue(
      new AuditError("unavailable", "Server error"),
    );

    const result = await getAuditLogsAction();

    expect(result).toEqual({
      success: false,
      error: translations.audit.error,
    });
  });
});
