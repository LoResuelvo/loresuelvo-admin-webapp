import "server-only";
import type { OperationFilters, OperationRepository } from "@/ports/operations/operation-repository";
import type { OperationSummary } from "@/domain/operations/operation-summary";
import { OperationError } from "@/domain/operations/operation-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapOperations } from "./mappers/operation-mapper";

async function getE2EOperationsStub(filters?: OperationFilters): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());

    if (filters?.bottleneck) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === `/admin/operations?bottleneck=${encodeURIComponent(filters.bottleneck!)}` ||
            s.endpoint === `/operations?bottleneck=${encodeURIComponent(filters.bottleneck!)}`),
      );
      if (match) return match;
    }

    if (filters?.q) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === `/admin/operations?q=${encodeURIComponent(filters.q!)}` ||
            s.endpoint === `/operations?q=${encodeURIComponent(filters.q!)}`),
      );
      if (match) return match;
    }

    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint.startsWith("/admin/operations") || s.endpoint.startsWith("/operations")),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function resolveOperationsFromStub(
  stub: ApiStub,
  filters?: OperationFilters,
): Promise<OperationSummary[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new OperationError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new OperationError("unavailable", `Failed to fetch operations: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new OperationError("unknown", `Failed to fetch operations: ${stub.status}`);
  }

  let result = mapOperations(stub.body);

  if (filters?.bottleneck) {
    result = result.filter((op) => op.bottleneck === filters.bottleneck);
  }

  if (filters?.categoryId) {
    result = result.filter((op) => op.category.id === filters.categoryId);
  }

  if (filters?.q) {
    const query = filters.q.toLowerCase();
    result = result.filter(
      (op) =>
        op.consumer.name.toLowerCase().includes(query) ||
        op.consumer.surname.toLowerCase().includes(query) ||
        op.consumer.email.toLowerCase().includes(query) ||
        op.provider.name.toLowerCase().includes(query) ||
        op.provider.surname.toLowerCase().includes(query) ||
        op.provider.email.toLowerCase().includes(query),
    );
  }

  return result;
}

function buildOperationsUrl(baseUrl: string, filters?: OperationFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/operations`);
  if (filters?.bottleneck) url.searchParams.set("bottleneck", filters.bottleneck);
  if (filters?.categoryId) url.searchParams.set("category_id", String(filters.categoryId));
  if (filters?.q) url.searchParams.set("q", filters.q);
  return url;
}

async function fetchOperationsFromApi(
  token: string,
  filters?: OperationFilters,
): Promise<OperationSummary[]> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = buildOperationsUrl(baseUrl, filters);
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err: unknown) {
    if (err instanceof OperationError) throw err;
    throw new OperationError("unavailable", "Network error when fetching operations");
  }

  if (response.status === 403) {
    throw new OperationError("forbidden", "Forbidden");
  }
  if (response.status >= 500) {
    throw new OperationError("unavailable", `Failed to fetch operations: ${response.status}`);
  }
  if (!response.ok) {
    throw new OperationError("unknown", `Failed to fetch operations: ${response.status}`);
  }

  const data = await response.json();
  return mapOperations(data);
}

export const apiOperationRepository: OperationRepository = {
  async getOperations(token: string, filters?: OperationFilters): Promise<OperationSummary[]> {
    const stub = await getE2EOperationsStub(filters);
    if (stub) {
      return resolveOperationsFromStub(stub, filters);
    }
    return fetchOperationsFromApi(token, filters);
  },
};
