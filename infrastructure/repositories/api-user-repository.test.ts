import { afterEach, describe, expect, it, vi } from "vitest";
import { UserError } from "@/domain/users/user-error";
import { apiUserRepository } from "./api-user-repository";

describe("apiUserRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("requests /admin/consumers with bearer token and returns mapped consumers", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const sampleData = [
      {
        id: 1,
        role: "consumer",
        name: "Ana",
        surname: "Pérez",
        email: "ana@example.com",
        profile_photo_url: "https://example.com/photos/ana.jpg",
        created_on: "2026-09-10",
      },
    ];
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleData)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiUserRepository.getConsumers("test-token");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/consumers",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer test-token",
          Accept: "application/json",
        },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result).toEqual([
      {
        id: 1,
        name: "Ana",
        surname: "Pérez",
        email: "ana@example.com",
        profilePhotoUrl: "https://example.com/photos/ana.jpg",
        createdOn: "2026-09-10",
      },
    ]);
  });

  it("includes q query param when provided", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([])));
    vi.stubGlobal("fetch", fetcher);

    await apiUserRepository.getConsumers("test-token", "perez");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/consumers?q=perez",
      expect.any(Object),
    );
  });

  it("throws error if API_URL is not configured", async () => {
    vi.stubEnv("API_URL", "");
    await expect(apiUserRepository.getConsumers("token")).rejects.toThrow("API_URL is not configured");
  });

  it("throws UserError with forbidden code on 403 Forbidden", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

    await expect(apiUserRepository.getConsumers("token")).rejects.toSatisfy(
      (err) => err instanceof UserError && err.code === "forbidden",
    );
  });

  it("throws UserError with unavailable code on 500 Server Error", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Internal error", { status: 500 })));

    await expect(apiUserRepository.getConsumers("token")).rejects.toSatisfy(
      (err) => err instanceof UserError && err.code === "unavailable",
    );
  });

  it("throws UserError with unavailable code on network failure", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network connection error")));

    await expect(apiUserRepository.getConsumers("token")).rejects.toSatisfy(
      (err) => err instanceof UserError && err.code === "unavailable",
    );
  });

  describe("getProviders", () => {
    const sampleProviderDto = [
      {
        id: 1,
        role: "provider",
        name: "Juan",
        surname: "Gómez",
        email: "juan@example.com",
        profile_photo_url: "https://example.com/photos/juan.jpg",
        created_on: "2026-09-10",
        category: { id: 10, name: "Plomería" },
        coverage_zones: [
          { id: 1, name: "Comuna 6", code: "comuna_6" },
          { id: 2, name: "Comuna 14", code: "comuna_14" },
        ],
        identity_verification_status: "approved",
      },
    ];

    it("requests /admin/providers with bearer token and returns mapped providers", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleProviderDto)));
      vi.stubGlobal("fetch", fetcher);

      const result = await apiUserRepository.getProviders("test-token");

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.com/admin/providers",
        expect.objectContaining({
          cache: "no-store",
          headers: {
            Authorization: "Bearer test-token",
            Accept: "application/json",
          },
          signal: expect.any(AbortSignal),
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Juan");
      expect(result[0].category.name).toBe("Plomería");
    });

    it("appends filters as query parameters", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([])));
      vi.stubGlobal("fetch", fetcher);

      await apiUserRepository.getProviders("test-token", {
        q: "juan",
        categoryId: 10,
        coverageZoneId: 1,
        verificationStatus: "approved",
      });

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.com/admin/providers?q=juan&category_id=10&coverage_zone_id=1&identity_verification_status=approved",
        expect.any(Object),
      );
    });

    it("throws UserError with forbidden code on 403 Forbidden", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

      await expect(apiUserRepository.getProviders("token")).rejects.toSatisfy(
        (err) => err instanceof UserError && err.code === "forbidden",
      );
    });

    it("throws UserError with unavailable code on network failure", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network connection error")));

      await expect(apiUserRepository.getProviders("token")).rejects.toSatisfy(
        (err) => err instanceof UserError && err.code === "unavailable",
      );
    });
  });

  describe("getConsumerHistory", () => {
    it("delegates to fetchConsumerHistory", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const sample = {
        id: 301,
        name: "Carlos",
        surname: "López",
        email: "carlos@example.com",
        phone: "+54 11 4444-2222",
        registered_at: "2026-09-01T10:00:00-03:00",
        current_address: "Av. Rivadavia 4500",
        coverage_zone: { id: 6, name: "Comuna 6" },
        history: [],
        pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(sample))));

      const result = await apiUserRepository.getConsumerHistory("test-token", 301);
      expect(result.id).toBe(301);
      expect(result.name).toBe("Carlos");
    });
  });
});

