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

function messageFromErrorBody(body: unknown): string {
  if (typeof body === "string") return body;
  if (body && typeof body === "object" && "error" in body) {
    const message = (body as { error?: unknown }).error;
    if (typeof message === "string") return message;
  }
  return "";
}

function handleCategoryError(status: number, action: string, body?: unknown): never {
  const message = messageFromErrorBody(body).toLowerCase();
  if (status === 409) {
    if (message.includes("already exists")) {
      throw new CategoryError("duplicate", "Category already exists");
    }
    if (message.includes("confirmation")) {
      throw new CategoryError("confirmationRequired", "Confirmation required");
    }
    throw new CategoryError("conflict", "Category version conflict");
  }
  if (status === 403) {
    throw new CategoryError("forbidden", "Forbidden");
  }
  if (status === 404) {
    throw new CategoryError("notFound", "Category not found");
  }
  if (status === 400) {
    throw new CategoryError("invalid", `Invalid category request: ${message || status}`);
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
    const stub = await getE2EStub("GET", "/categories?include_disabled=true") ?? await getE2EStub("GET", "/categories");
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "fetch categories");
      return mapCategories(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}/categories?include_disabled=true`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "fetch categories", await response.json().catch(() => null));
    return mapCategories(await response.json());
  },

  async create(token: string, name: string): Promise<Category> {
    const stub = await getE2EStub("POST", "/categories");
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "create category", stub.body);
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

    if (!response.ok) handleCategoryError(response.status, "create category", await response.json().catch(() => null));
    return mapCreatedCategory(await response.json());
  },

  async update(token: string, id: number, name: string, expectedVersion: number): Promise<Category> {
    const endpoint = `/categories/${id}`;
    const stub = await getE2EStub("PATCH", endpoint);
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "update category", stub.body);
      return mapCategory(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, expected_version: expectedVersion }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "update category", await response.json().catch(() => null));
    return mapCategory(await response.json());
  },

  async getImpact(token: string, id: number): Promise<CategoryImpact> {
    const endpoint = `/admin/categories/${id}/impact`;
    const stub = await getE2EStub("GET", endpoint);
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "fetch category impact", stub.body);
      return mapCategoryImpact(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "fetch category impact", await response.json().catch(() => null));
    return mapCategoryImpact(await response.json());
  },

  async deactivate(
    token: string,
    id: number,
    expectedVersion: number,
    reason: string,
    confirmOngoingOrders: boolean,
  ): Promise<Category> {
    const endpoint = `/categories/${id}`;
    const stub = await getE2EStub("PATCH", endpoint);
    if (stub) {
      if (stub.delayMs) await new Promise((r) => setTimeout(r, stub.delayMs));
      if (stub.status >= 400) handleCategoryError(stub.status, "deactivate category", stub.body);
      return mapCategory(stub.body);
    }

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        enabled: false,
        expected_version: expectedVersion,
        reason,
        confirm_ongoing_orders: confirmOngoingOrders,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) handleCategoryError(response.status, "deactivate category", await response.json().catch(() => null));
    return mapCategory(await response.json());
  },
};

