import { describe, expect, it, vi } from "vitest";
import type { AuditLogEntry } from "@/domain/audit/audit-log";
import type { AuditRepository } from "@/ports/audit/audit-repository";
import { getAuditLogs } from "./get-audit-logs";

describe("getAuditLogs use case", () => {
  const mockEntry: AuditLogEntry = {
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
  };

  it("delegates to AuditRepository with token and filters", async () => {
    const repository: AuditRepository = {
      getAuditLogs: vi.fn().mockResolvedValue([mockEntry]),
    };

    const result = await getAuditLogs(repository, "test-token", { action: "chat_access" });

    expect(repository.getAuditLogs).toHaveBeenCalledWith("test-token", { action: "chat_access" });
    expect(result).toEqual([mockEntry]);
  });

  it("propagates repository errors", async () => {
    const repository: AuditRepository = {
      getAuditLogs: vi.fn().mockRejectedValue(new Error("Network failure")),
    };

    await expect(getAuditLogs(repository, "token")).rejects.toThrow("Network failure");
  });
});
