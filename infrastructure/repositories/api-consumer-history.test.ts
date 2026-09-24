import { afterEach, describe, expect, it, vi } from "vitest";
import { UserError } from "@/domain/users/user-error";
import { fetchConsumerHistory } from "./api-consumer-history";

describe("fetchConsumerHistory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleConsumerHistoryDto = {
    id: 301,
    name: "Carlos",
    surname: "López",
    email: "carlos@example.com",
    phone: "+54 11 4444-2222",
    profile_photo_url: "https://storage.loresuelvo.internal/profiles/301.jpg",
    registered_at: "2026-09-01T10:00:00-03:00",
    current_address: "Av. Rivadavia 4500",
    coverage_zone: {
      id: 6,
      name: "Comuna 6",
    },
    history: [
      {
        resource_id: 105,
        operation_id: 105,
        resource_type: "work_order",
        category_name: "Plomería",
        provider: {
          id: 201,
          name: "Juan Gómez",
          profile_photo_url: "https://storage.loresuelvo.internal/profiles/201.jpg",
        },
        status: "completed",
        total_amount_cents: 2000000,
        created_at: "2026-09-20T10:00:00-03:00",
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      total_pages: 1,
    },
  };

  it("requests /admin/consumers/:id/history with bearer token and returns mapped entity", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleConsumerHistoryDto)));
    vi.stubGlobal("fetch", fetcher);

    const result = await fetchConsumerHistory("test-token", 301, {
      status: "completed",
      resourceType: "work_order",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/consumers/301/history?resource_type=work_order&status=completed",
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
    expect(result.coverageZone.name).toBe("Comuna 6");
    expect(result.history).toHaveLength(1);
    expect(result.history[0].categoryName).toBe("Plomería");
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
