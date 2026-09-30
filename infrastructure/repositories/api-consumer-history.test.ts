import { afterEach, describe, expect, it, vi } from "vitest";
import { UserError } from "@/domain/users/user-error";
import { fetchConsumerHistory } from "./api-consumer-history";

describe("fetchConsumerHistory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleConsumerHistoryDto = {
    consumer: {
      id: 301,
      role: "consumer",
      name: "Carlos",
      surname: "López",
      email: "carlos@example.com",
      profile_photo_url: "https://storage.loresuelvo.internal/profiles/301.jpg",
      created_on: "2026-09-01T10:00:00-03:00",
      address: {
        street: "Av. Rivadavia",
        street_number: "4500",
        floor: null,
        unit: null,
        source: "current_consumer_profile",
      },
      coverage_zone: {
        id: 6,
        name: "Comuna 6",
        enabled: true,
        source: "current_consumer_profile",
      },
    },
    summary: { job_requests: 3, service_proposals: 2, work_orders: 4 },
    page: {
      items: [
        {
          type: "work_order",
          id: 105,
          status: "paid",
          provider: { id: 201, name: "Juan", surname: "Gómez" },
          occurred_on: "2026-09-20T10:00:00-03:00",
          operation: {
            id: "jr-105",
            url: "/admin/operations/jr-105",
            required_permission: "read:admin_operations",
            chat_required_permission: "read:admin_chat_audit",
          },
          job_request_id: 5,
          service_proposal_id: 17,
          accepted_on: "2026-09-19T10:00:00-03:00",
          completion_reported_on: "2026-09-20T10:00:00-03:00",
          balance_paid_on: "2026-09-20T10:01:00-03:00",
        },
      ],
      limit: 20,
      next_cursor: "signed-next-page",
    },
  };

  it("requests /admin/consumers/:id/history with bearer token and returns mapped entity", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleConsumerHistoryDto)));
    vi.stubGlobal("fetch", fetcher);

    const result = await fetchConsumerHistory("test-token", 301, {
      status: "paid",
      resourceType: "work_order",
      limit: 20,
      cursor: "signed-next-page",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/consumers/301/history?type=work_order&status=paid&limit=20&cursor=signed-next-page",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer test-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result.id).toBe(301);
    expect(result.name).toBe("Carlos");
    expect(result.currentAddress).toBe("Av. Rivadavia 4500");
    expect(result.coverageZone).toEqual({ id: 6, name: "Comuna 6" });
    expect(result.phone).toBeUndefined();
    expect(result.history).toHaveLength(1);
    expect(result.history[0]).toMatchObject({
      operationId: "jr-105",
      resourceType: "work_order",
      provider: { name: "Juan Gómez" },
      status: "paid",
    });
    expect(result.history[0]).not.toHaveProperty("categoryName");
    expect(result.history[0]).not.toHaveProperty("totalAmountCents");
    expect(result.pagination).toEqual({
      limit: 20,
      hasMore: true,
      nextCursor: "signed-next-page",
    });
  });

  it("throws forbidden UserError when API returns 403", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(fetchConsumerHistory("test-token", 301)).rejects.toThrow(
      new UserError("forbidden", "Forbidden"),
    );
  });

  it("throws not_found UserError when API returns 404", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(fetchConsumerHistory("test-token", 301)).rejects.toThrow(
      new UserError("not_found", "Consumer not found"),
    );
  });

  it("throws unavailable UserError when API returns 500", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Server Error", { status: 500 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(fetchConsumerHistory("test-token", 301)).rejects.toThrow(
      new UserError("unavailable", "Failed to fetch consumer history: 500"),
    );
  });
});
