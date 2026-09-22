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
});
