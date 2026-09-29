import { afterEach, describe, expect, it, vi } from "vitest";
import { AuditError } from "@/domain/audit/audit-error";
import { apiAuditRepository } from "./api-audit-repository";

describe("apiAuditRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleListResponse = [
    {
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
    },
  ];

  it("calls /admin/audit-logs with auth bearer token and parses list", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleListResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiAuditRepository.getAuditLogs("my-token", {
      action: "chat_access",
      operator: "operador@loresuelvo.com",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/audit-logs?action=chat_access&operator=operador%40loresuelvo.com",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("aud-001");
    expect(result[0].actionLabel).toBe("Acceso a chat privado");
  });

  it("throws error when API_URL is missing", async () => {
    vi.stubEnv("API_URL", "");
    await expect(apiAuditRepository.getAuditLogs("token")).rejects.toThrow("API_URL is not configured");
  });

  it("throws AuditError('forbidden') on 403 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

    await expect(apiAuditRepository.getAuditLogs("token")).rejects.toThrow(AuditError);
  });

  it("throws AuditError('unavailable') on 500 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server Error", { status: 500 })));

    await expect(apiAuditRepository.getAuditLogs("token")).rejects.toThrow(AuditError);
  });
});
