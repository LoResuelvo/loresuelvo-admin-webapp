import { afterEach, describe, expect, it, vi } from "vitest";
import { apiOperationRepository } from "./api-operation-repository";
import { operation } from "./mappers/operation-fixtures";
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ getAll: () => [] }) }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("operations HTTP contract", () => {
  it("encodes an operation identifier as one URL segment", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetcher);
    await expect(apiOperationRepository.getOperationById("token", "../unsafe")).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledWith("https://api.example/admin/operations/..%2Funsafe", expect.any(Object));
  });

  it.each([
    ["request_pending_over_24h", "request_pending_over_24h"],
    ["booking_deadline_passed", "booking_deadline_passed"],
    ["delayed", "delayed"],
    ["stalled", "stalled"],
  ] as const)("sends the supported %s alert filter", async (bottleneck, expectedAlert) => {
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValue(Response.json({
      operations: [{ ...operation, alerts: [expectedAlert] }],
      next_cursor: null,
    }));
    vi.stubGlobal("fetch", fetcher);

    await apiOperationRepository.getOperations("token", { bottleneck });

    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.searchParams.get("alert")).toBe(expectedAlert);
    expect(url.searchParams.has("stage")).toBe(false);
  });

  it("combines provider, category, stage, and cursor using supported query names", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValue(Response.json({
      operations: [operation],
      next_cursor: "opaque",
    }));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiOperationRepository.getOperations("token", {
      bottleneck: "pending_final_payment",
      providerId: 201,
      categoryId: 8,
      cursor: "previous",
    });

    const url = new URL(fetcher.mock.calls[0][0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      category_id: "8",
      cursor: "previous",
      provider_id: "201",
      stage: "work_order_awaiting_payment",
    });
    expect(result.nextCursor).toBe("opaque");
  });

  it("searches later pages without sending an unsupported text parameter", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({
      operations: [operation],
      next_cursor: "second",
    })).mockResolvedValueOnce(Response.json({
      operations: [{
        ...operation,
        id: "jr-2",
        consumer: {
          id: 8,
          name: "Carla",
          surname: "Sosa",
        },
      }],
      next_cursor: null,
    }));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiOperationRepository.getOperations("token", { q: "Carla Sosa" });

    expect(result.operations.map(op => op.id)).toEqual(["jr-2"]);
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("cursor")).toBe("second");
    expect(fetcher.mock.calls.every(call => !new URL(call[0]).searchParams.has("q"))).toBe(true);
  });

  it("scans pages locally for operations without alerts", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({
      operations: [{ ...operation, alerts: ["stalled"] }],
      next_cursor: "second",
    })).mockResolvedValueOnce(Response.json({
      operations: [{ ...operation, id: "jr-2", alerts: [] }],
      next_cursor: null,
    }));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiOperationRepository.getOperations("token", { bottleneck: "none" });

    expect(result.operations.map(op => op.id)).toEqual(["jr-2"]);
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.has("alert")).toBe(false);
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("cursor")).toBe("second");
  });
});
