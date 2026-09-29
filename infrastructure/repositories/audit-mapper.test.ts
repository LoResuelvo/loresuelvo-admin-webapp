import { describe, expect, it } from "vitest";
import { mapAuditLogEntry, mapAuditLogsList } from "./audit-mapper";
import type { ApiAuditLogEntry } from "@/infrastructure/api/audit-types";

describe("audit-mapper", () => {
  const sampleDto: ApiAuditLogEntry = {
    id: "aud-001",
    timestamp: "2026-09-28T14:30:00Z",
    operator_id: "op-101",
    operator_email: "operador@loresuelvo.com",
    action: "chat_access",
    resource_type: "operation",
    resource_id: "105",
    reason: "Investigación de reporte por posible fraude",
    ip_address: "192.168.1.50",
    user_agent: "Mozilla/5.0",
    status: "success",
    metadata: { conversationId: 105 },
  };

  it("maps single ApiAuditLogEntry to AuditLogEntry domain model", () => {
    const domain = mapAuditLogEntry(sampleDto);

    expect(domain.id).toBe("aud-001");
    expect(domain.timestamp).toBe("2026-09-28T14:30:00Z");
    expect(domain.operatorId).toBe("op-101");
    expect(domain.operatorEmail).toBe("operador@loresuelvo.com");
    expect(domain.action).toBe("chat_access");
    expect(domain.actionLabel).toBe("Acceso a chat privado");
    expect(domain.resourceType).toBe("operation");
    expect(domain.resourceId).toBe("105");
    expect(domain.reason).toBe("Investigación de reporte por posible fraude");
    expect(domain.status).toBe("success");
    expect(domain.metadata).toEqual({ conversationId: 105 });
  });

  it("maps list of DTOs", () => {
    const list = mapAuditLogsList([sampleDto]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("aud-001");
  });

  it("throws error for invalid DTO payload", () => {
    expect(() => mapAuditLogsList({ invalid: true })).toThrow("Invalid audit logs response");
  });
});
