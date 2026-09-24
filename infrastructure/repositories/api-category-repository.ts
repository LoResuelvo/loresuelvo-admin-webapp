import "server-only";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import type { Category } from "@/domain/categories/category";
import { CategoryError } from "@/domain/categories/category-error";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapCategories, mapCategory, mapCreatedCategory } from "./category-mapper";

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

export const apiCategoryRepository: CategoryRepository = {
  async getAll(token: string) {
    const stub = await getE2EStub("GET", "/categories");
    if (stub) {
      if (stub.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
      }
      if (stub.status >= 400) {
        throw new Error(`Failed to fetch categories: ${stub.status}`);
      }
      return mapCategories(stub.body);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
    return mapCategories(data);
  },

  async create(token: string, name: string): Promise<Category> {
    const stub = await getE2EStub("POST", "/categories");
    if (stub) {
      if (stub.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
      }
      if (stub.status === 409) {
        throw new CategoryError("duplicate", "Category already exists");
      }
      if (stub.status === 403) {
        throw new CategoryError("forbidden", "Forbidden");
      }
      if (stub.status >= 500) {
        throw new CategoryError("unavailable", `Failed to create category: ${stub.status}`);
      }
      if (stub.status >= 400) {
        throw new Error(`Failed to create category: ${stub.status}`);
      }
      return mapCreatedCategory(stub.body);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/categories`, {
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

    if (response.status === 409) {
      throw new CategoryError("duplicate", "Category already exists");
    }
    if (response.status === 403) {
      throw new CategoryError("forbidden", "Forbidden");
    }
    if (response.status >= 500) {
      throw new CategoryError("unavailable", `Failed to create category: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.status}`);
    }

    const data = await response.json();
    return mapCreatedCategory(data);
  },

  async update(token: string, id: number, name: string): Promise<Category> {
    const endpoint = `/categories/${id}`;
    const stub = await getE2EStub("PATCH", endpoint);
    if (stub) {
      if (stub.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
      }
      if (stub.status === 409) {
        throw new CategoryError("duplicate", "Category already exists");
      }
      if (stub.status === 403) {
        throw new CategoryError("forbidden", "Forbidden");
      }
      if (stub.status >= 500) {
        throw new CategoryError("unavailable", `Failed to update category: ${stub.status}`);
      }
      if (stub.status >= 400) {
        throw new Error(`Failed to update category: ${stub.status}`);
      }
      return mapCategory(stub.body);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/categories/${id}`, {
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

    if (response.status === 409) {
      throw new CategoryError("duplicate", "Category already exists");
    }
    if (response.status === 403) {
      throw new CategoryError("forbidden", "Forbidden");
    }
    if (response.status >= 500) {
      throw new CategoryError("unavailable", `Failed to update category: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.status}`);
    }

    const data = await response.json();
    return mapCategory(data);
  },
};
