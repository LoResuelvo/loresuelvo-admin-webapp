import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryError } from "@/domain/categories/category-error";
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

    it("throws CategoryError with duplicate code on 409 Conflict", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Conflict", { status: 409 })));
      await expect(apiCategoryRepository.create("token", "Plomería")).rejects.toSatisfy(
        (err) => err instanceof CategoryError && err.code === "duplicate",
      );
    });

    it("throws CategoryError with forbidden code on 403 Forbidden", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));
      await expect(apiCategoryRepository.create("token", "Plomería")).rejects.toSatisfy(
        (err) => err instanceof CategoryError && err.code === "forbidden",
      );
    });

    it("throws CategoryError with unavailable code on 500 Server Error", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Internal error", { status: 500 })));
      await expect(apiCategoryRepository.create("token", "Plomería")).rejects.toSatisfy(
        (err) => err instanceof CategoryError && err.code === "unavailable",
      );
    });

    it("throws error if HTTP response is not ok (e.g. 400)", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Bad request", { status: 400 })));
      await expect(apiCategoryRepository.create("token", "Plomería")).rejects.toThrow("Failed to create category: 400");
    });
  });

  describe("update", () => {
    it("patches /categories/:id with bearer token and body and returns mapped category", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const updatedData = { id: 1, name: "Instalaciones Sanitarias" };
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(updatedData), { status: 200 }));
      vi.stubGlobal("fetch", fetcher);

      const result = await apiCategoryRepository.update("test-token", 1, "Instalaciones Sanitarias");

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.com/categories/1",
        expect.objectContaining({
          method: "PATCH",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name: "Instalaciones Sanitarias" }),
        }),
      );
      expect(result).toEqual({ id: 1, name: "Instalaciones Sanitarias" });
    });

    it("throws error if API_URL is not configured for update", async () => {
      vi.stubEnv("API_URL", "");
      await expect(apiCategoryRepository.update("token", 1, "Plomería")).rejects.toThrow("API_URL is not configured");
    });

    it("throws CategoryError with duplicate code on 409 Conflict", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Conflict", { status: 409 })));
      await expect(apiCategoryRepository.update("token", 1, "Gasista")).rejects.toSatisfy(
        (err) => err instanceof CategoryError && err.code === "duplicate",
      );
    });

    it("throws CategoryError with forbidden code on 403 Forbidden", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));
      await expect(apiCategoryRepository.update("token", 1, "Plomería")).rejects.toSatisfy(
        (err) => err instanceof CategoryError && err.code === "forbidden",
      );
    });

    it("throws CategoryError with unavailable code on 500 Server Error", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Internal error", { status: 500 })));
      await expect(apiCategoryRepository.update("token", 1, "Plomería")).rejects.toSatisfy(
        (err) => err instanceof CategoryError && err.code === "unavailable",
      );
    });

    it("throws error if HTTP response is not ok (e.g. 400)", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Bad request", { status: 400 })));
      await expect(apiCategoryRepository.update("token", 1, "Plomería")).rejects.toThrow("Failed to update category: 400");
    });
  });
});


