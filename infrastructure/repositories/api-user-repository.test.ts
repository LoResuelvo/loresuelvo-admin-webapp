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

  it("throws error if HTTP response is other non-ok status (e.g. 400)", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Bad request", { status: 400 })));

    await expect(apiUserRepository.getConsumers("token")).rejects.toThrow("Failed to fetch consumers: 400");
  });
});
