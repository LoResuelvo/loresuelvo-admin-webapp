import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditError } from "@/domain/audit/audit-error";
import type { AuditLogEntry } from "@/domain/audit/audit-log";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

const mockAuditLogsList: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-09-28T14:30:00Z",
    operatorId: "op-101",
    operatorEmail: "operador@loresuelvo.com",
    action: "chat_access",
    actionLabel: "Acceso a chat privado",
    resourceType: "operation",
    resourceId: "105",
    reason: "Investigación de reporte por posible fraude",
    ipAddress: "192.168.1.50",
    userAgent: "Mozilla/5.0",
    status: "success",
  },
];

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

  it("returns audit logs on successful repository call", async () => {
    vi.mocked(apiAuditRepository.getAuditLogs).mockResolvedValue(mockAuditLogsList);

    const result = await getAuditLogsAction({ action: "chat_access" });

    expect(result).toEqual({
      success: true,
      data: mockAuditLogsList,
    });
    expect(apiAuditRepository.getAuditLogs).toHaveBeenCalledWith("mock-jwt-token", {
      action: "chat_access",
    });
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
      error: "Ocurrió un error al cargar la bitácora de auditoría.",
    });
  });
});
