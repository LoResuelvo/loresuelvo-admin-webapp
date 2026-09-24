import "server-only";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import type { Category } from "@/domain/categories/category";
import type { CategoryImpact } from "@/domain/categories/category-impact";
import { CategoryError } from "@/domain/categories/category-error";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import {
  mapCategories,
  mapCategory,
  mapCategoryImpact,
  mapCreatedCategory,
} from "./category-mapper";

async function getE2EStub(
  method: "GET" | "POST" | "PATCH" = "GET",
  endpoint?: string,
) {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    if (endpoint) {
      const match = stubs.find((s) => s.method === method && s.endpoint === endpoint);
      if (match) return match;
    }
    return (
      stubs.find(
        (s) =>
          s.method === method &&
          (s.endpoint === "/categories" || s.endpoint.startsWith("/categories/")),
      ) ?? null
    );
  } catch {
    return null;
  }
}

function handleCategoryError(status: number, action: string): never {
  if (status === 409) {
    throw new CategoryError("duplicate", "Category already exists");
  }
  if (status === 403) {
    throw new CategoryError("forbidden", "Forbidden");
  }
  if (status >= 500) {
    throw new CategoryError("unavailable", `Failed to ${action}: ${status}`);
  }
  throw new Error(`Failed to ${action}: ${status}`);
}

function getBaseUrl(): string {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }
  return baseUrl.replace(/\/$/, "");
}

export const apiCategoryRepository: CategoryRepository = {
  async getAll(token: string) {
    const stub = await getE2EStub("GET", "/categories");
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "fetch categories");
      return mapCategories(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}/categories`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "fetch categories");
    return mapCategories(await response.json());
  },

  async create(token: string, name: string): Promise<Category> {
    const stub = await getE2EStub("POST", "/categories");
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "create category");
      return mapCreatedCategory(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "create category");
    return mapCreatedCategory(await response.json());
  },

  async update(token: string, id: number, name: string): Promise<Category> {
    const endpoint = `/categories/${id}`;
    const stub = await getE2EStub("PATCH", endpoint);
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "update category");
      return mapCategory(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "update category");
    return mapCategory(await response.json());
  },

  async getImpact(token: string, id: number): Promise<CategoryImpact> {
    const endpoint = `/admin/categories/${id}/impact`;
    const stub = await getE2EStub("GET", endpoint);
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "fetch category impact");
      return mapCategoryImpact(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "fetch category impact");
    return mapCategoryImpact(await response.json());
  },

  async deactivate(token: string, id: number): Promise<Category> {
    const endpoint = `/categories/${id}`;
    const stub = await getE2EStub("PATCH", endpoint);
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "deactivate category");
      return mapCategory(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ enabled: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "deactivate category");
    return mapCategory(await response.json());
  },
};

