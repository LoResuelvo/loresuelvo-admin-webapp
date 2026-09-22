import { afterEach, describe, expect, it, vi } from "vitest";
import { apiCategoryRepository } from "./api-category-repository";

describe("apiCategoryRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("requests /categories with bearer token and returns mapped categories", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const sampleData = [
      { id: 2, name: "Electricidad" },
      { id: 1, name: "Albañilería" },
    ];
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleData)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiCategoryRepository.getAll("test-token");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/categories",
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
      { id: 1, name: "Albañilería" },
      { id: 2, name: "Electricidad" },
    ]);
  });

  it("throws error if API_URL is not configured", async () => {
    vi.stubEnv("API_URL", "");
    await expect(apiCategoryRepository.getAll("token")).rejects.toThrow("API_URL is not configured");
  });

  it("throws error if HTTP response is not ok", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Internal error", { status: 500 })));
    await expect(apiCategoryRepository.getAll("token")).rejects.toThrow("Failed to fetch categories: 500");
  });

  describe("create", () => {
    it("posts /categories with bearer token and body and returns mapped category", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const createdData = { id: 10, name: "Plomería", normalized_name: "plomeria" };
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(createdData), { status: 201 }));
      vi.stubGlobal("fetch", fetcher);

      const result = await apiCategoryRepository.create("test-token", "Plomería");

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.com/categories",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name: "Plomería" }),
        }),
      );
      expect(result).toEqual({ id: 10, name: "Plomería" });
    });

    it("throws error if API_URL is not configured for create", async () => {
      vi.stubEnv("API_URL", "");
      await expect(apiCategoryRepository.create("token", "Plomería")).rejects.toThrow("API_URL is not configured");
    });

    it("throws error if HTTP response is not ok for create", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Internal error", { status: 500 })));
      await expect(apiCategoryRepository.create("token", "Plomería")).rejects.toThrow("Failed to create category: 500");
    });
  });
});

