import "server-only";
import type { ConsumerDetail, ConsumerHistoryFilters } from "@/domain/users/consumer-history";
import { UserError } from "@/domain/users/user-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapConsumerDetail } from "./mappers/user-mapper";

async function getE2EConsumerHistoryStub(
  id: number | string,
): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === `/admin/consumers/${id}/history` ||
            s.endpoint.startsWith(`/admin/consumers/${id}/history?`)),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function resolveConsumerHistoryFromStub(
  stub: ApiStub,
): Promise<ConsumerDetail> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (stub.status === 404) {
    throw new UserError("not_found", "Consumer not found");
  }
  if (stub.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch consumer history: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new Error(`Failed to fetch consumer history: ${stub.status}`);
  }
  return mapConsumerDetail(stub.body);
}

function buildConsumerHistoryUrl(
  baseUrl: string,
  id: number | string,
  filters?: ConsumerHistoryFilters,
): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/consumers/${id}/history`);
  if (filters?.resourceType) url.searchParams.set("resource_type", filters.resourceType);
  if (filters?.status) url.searchParams.set("status", filters.status);
  if (filters?.from) url.searchParams.set("from", filters.from);
  if (filters?.to) url.searchParams.set("to", filters.to);
  if (filters?.page !== undefined) url.searchParams.set("page", String(filters.page));
  if (filters?.limit !== undefined) url.searchParams.set("limit", String(filters.limit));
  return url;
}

async function fetchConsumerHistoryFromApi(
  token: string,
  id: number | string,
  filters?: ConsumerHistoryFilters,
): Promise<ConsumerDetail> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = buildConsumerHistoryUrl(baseUrl, id, filters);
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
    if (err instanceof UserError) throw err;
    throw new UserError("unavailable", "Network error when fetching consumer history");
  }

  if (response.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (response.status === 404) {
    throw new UserError("not_found", "Consumer not found");
  }
  if (response.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch consumer history: ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch consumer history: ${response.status}`);
  }

  const data = await response.json();
  return mapConsumerDetail(data);
}

export async function fetchConsumerHistory(
  token: string,
  id: number | string,
  filters?: ConsumerHistoryFilters,
): Promise<ConsumerDetail> {
  const stub = await getE2EConsumerHistoryStub(id);
  if (stub) {
    return resolveConsumerHistoryFromStub(stub);
  }
  return fetchConsumerHistoryFromApi(token, id, filters);
}
