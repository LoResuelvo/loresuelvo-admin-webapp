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
  it("evaluates the approved 24-hour filter without equating it to the API 72-hour alert", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValue(Response.json({
      operations: [{
          ...operation,
          stage: "request_pending",
          last_business_advance_on: "2026-09-28T10:00:00Z"
        }, {
          ...operation,
          id: "jr-2",
          stage: "request_pending",
          last_business_advance_on: null
        }],
      next_cursor: null
    }));
    vi.stubGlobal("fetch", fetcher);
    const result = await apiOperationRepository.getOperations("token", { bottleneck: "stalled" });
    expect(result.operations.map(op => op.id)).toEqual(["jr-1"]);
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.has("alert")).toBe(false);
    vi.useRealTimers();
  });
  it("uses supported stage and cursor parameters", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValue(Response.json({
      operations: [operation],
      next_cursor: "opaque"
    }));
    vi.stubGlobal("fetch", fetcher);
    const result = await apiOperationRepository.getOperations("token", {
      bottleneck: "pending_booking_deposit",
      categoryId: 8,
      cursor: "previous"
    });
    const url = new URL(fetcher.mock.calls[0][0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      category_id: "8",
      cursor: "previous",
      stage: "proposal_pending"
    });
    expect(result.nextCursor).toBe("opaque");
  });
  it("searches later pages without sending an unsupported text parameter", async () => {
    vi.stubEnv("API_URL", "https://api.example");
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({
      operations: [operation],
      next_cursor: "second"
    })).mockResolvedValueOnce(Response.json({
      operations: [{
          ...operation,
          id: "jr-2",
          consumer: {
            id: 8,
            name: "Carla",
            surname: "Sosa"
          }
        }],
      next_cursor: null
    }));
    vi.stubGlobal("fetch", fetcher);
    const result = await apiOperationRepository.getOperations("token", { q: "Carla Sosa" });
    expect(result.operations.map(op => op.id)).toEqual(["jr-2"]);
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("cursor")).toBe("second");
    expect(fetcher.mock.calls.every(call => !new URL(call[0]).searchParams.has("q"))).toBe(true);
  });
  it("does not silently run an unfiltered query for an unsupported proposal-age filter", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(apiOperationRepository.getOperations("token", { bottleneck: "pending_proposal_24h" })).rejects.toThrow("Request acceptance timestamp unavailable");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
