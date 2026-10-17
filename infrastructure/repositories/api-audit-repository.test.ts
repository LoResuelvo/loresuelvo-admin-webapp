import { afterEach, describe, expect, it, vi } from "vitest";
import { AuditError } from "@/domain/audit/audit-error";
import { apiAuditRepository } from "./api-audit-repository";

describe("apiAuditRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const samplePageResponse = {
    events: [
      {
        id: "018f3f3a-8e75-7bc4-9a50-8f512998d110",
        operator_id: 101,
        action: "access",
        resource_type: "operation",
        resource_id: "105",
        occurred_on: "2026-09-28T14:30:00Z",
        result: "succeeded",
        correlation_id: "trace-001",
        reason: "Investigación de reporte por posible fraude",
      },
    ],
    next_cursor: "next-page",
  };

  it("calls the API with contract filters, bearer token, and parses a page", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(samplePageResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiAuditRepository.getAuditLogs("my-token", {
      action: "access",
      operatorId: 101,
      from: "2026-09-01",
      to: "2026-09-20",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/audit-logs?action=access&operator_id=101&occurred_from=2026-09-01T00%3A00%3A00.000Z&occurred_to=2026-09-21T00%3A00%3A00.000Z",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result.events).toHaveLength(1);
    expect(result.events[0].id).toBe("018f3f3a-8e75-7bc4-9a50-8f512998d110");
    expect(result.events[0].operatorId).toBe(101);
    expect(result.events[0].action).toBe("access");
    expect(result.nextCursor).toBe("next-page");
  });

  it("continues the API cursor without resending filters", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      events: [],
      next_cursor: null,
    })));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiAuditRepository.getAuditLogs("token", undefined, "opaque cursor");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/audit-logs?cursor=opaque+cursor",
      expect.any(Object),
    );
    expect(result).toEqual({ events: [], nextCursor: null });
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
