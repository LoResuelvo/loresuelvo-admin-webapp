import "server-only";
import type { CategoryRepository } from "@/ports/categories/category-repository";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapCategories } from "./category-mapper";

async function getE2EStub() {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return stubs.find((s) => s.method === "GET" && s.endpoint === "/categories") ?? null;
  } catch {
    return null;
  }
}

export const apiCategoryRepository: CategoryRepository = {
  async getAll(token: string) {
    const stub = await getE2EStub();
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
};
