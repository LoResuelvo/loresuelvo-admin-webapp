import "server-only";
import type { ProviderFilters, UserRepository } from "@/ports/users/user-repository";
import type { Consumer } from "@/domain/users/consumer";
import type { Provider } from "@/domain/users/provider";
import type { ProviderDiagnostic } from "@/domain/users/provider-diagnostic";
import type { ConsumerDetail, ConsumerHistoryFilters } from "@/domain/users/consumer-history";
import { UserError } from "@/domain/users/user-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapConsumers, mapProviders } from "./user-mapper";
import { fetchProviderDiagnostic } from "./api-provider-diagnostic";
import { fetchConsumerHistory } from "./api-consumer-history";

async function getE2EConsumersStub(q?: string) {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    if (q) {
      const exact = stubs.find(
        (s) => s.method === "GET" && s.endpoint === `/admin/consumers?q=${encodeURIComponent(q)}`,
      );
      if (exact) return exact;
    }
    return stubs.find((s) => s.method === "GET" && s.endpoint === "/admin/consumers") ?? null;
  } catch {
    return null;
  }
}

async function resolveConsumersFromStub(stub: ApiStub, q?: string): Promise<Consumer[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch consumers: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new Error(`Failed to fetch consumers: ${stub.status}`);
  }
  let result = mapConsumers(stub.body);
  if (q && stub.endpoint === "/admin/consumers") {
    const query = q.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.surname.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query),
    );
  }
  return result;
}

async function fetchConsumersFromApi(token: string, q?: string): Promise<Consumer[]> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/consumers`);
  if (q) {
    url.searchParams.set("q", q);
  }

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
    throw new UserError("unavailable", "Network error when fetching consumers");
  }

  if (response.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (response.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch consumers: ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch consumers: ${response.status}`);
  }

  const data = await response.json();
  return mapConsumers(data);
}

async function getE2EProvidersStub(filters?: ProviderFilters) {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    if (filters?.q) {
      const exact = stubs.find(
        (s) => s.method === "GET" && s.endpoint === `/admin/providers?q=${encodeURIComponent(filters.q!)}`,
      );
      if (exact) return exact;
    }
    return stubs.find((s) => s.method === "GET" && s.endpoint.startsWith("/admin/providers")) ?? null;
  } catch {
    return null;
  }
}

async function resolveProvidersFromStub(stub: ApiStub, filters?: ProviderFilters): Promise<Provider[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch providers: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new Error(`Failed to fetch providers: ${stub.status}`);
  }
  let result = mapProviders(stub.body);
  if (filters?.q && stub.endpoint === "/admin/providers") {
    const query = filters.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.surname.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query),
    );
  }
  if (filters?.categoryId && stub.endpoint === "/admin/providers") {
    result = result.filter((p) => p.category.id === filters.categoryId);
  }
  if (filters?.category && stub.endpoint === "/admin/providers") {
    const catQuery = filters.category.toLowerCase();
    result = result.filter((p) => p.category.name.toLowerCase() === catQuery);
  }
  if (filters?.coverageZoneId && stub.endpoint === "/admin/providers") {
    result = result.filter((p) => p.coverageZones.some((z) => z.id === filters.coverageZoneId));
  }
  if (filters?.verificationStatus && stub.endpoint === "/admin/providers") {
    result = result.filter((p) => p.identityVerificationStatus === filters.verificationStatus);
  }
  return result;
}

function buildProvidersUrl(baseUrl: string, filters?: ProviderFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/providers`);
  if (filters?.q) url.searchParams.set("q", filters.q);
  if (filters?.categoryId) url.searchParams.set("category_id", String(filters.categoryId));
  if (filters?.category) url.searchParams.set("category", filters.category);
  if (filters?.coverageZoneId) url.searchParams.set("coverage_zone_id", String(filters.coverageZoneId));
  if (filters?.verificationStatus) url.searchParams.set("identity_verification_status", filters.verificationStatus);
  return url;
}

async function fetchProvidersFromApi(token: string, filters?: ProviderFilters): Promise<Provider[]> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = buildProvidersUrl(baseUrl, filters);
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
    throw new UserError("unavailable", "Network error when fetching providers");
  }

  if (response.status === 403) {
    throw new UserError("forbidden", "Forbidden");
  }
  if (response.status >= 500) {
    throw new UserError("unavailable", `Failed to fetch providers: ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch providers: ${response.status}`);
  }

  const data = await response.json();
  return mapProviders(data);
}

export const apiUserRepository: UserRepository = {
  async getConsumers(token: string, q?: string): Promise<Consumer[]> {
    const stub = await getE2EConsumersStub(q);
    if (stub) {
      return resolveConsumersFromStub(stub, q);
    }
    return fetchConsumersFromApi(token, q);
  },

  async getProviders(token: string, filters?: ProviderFilters): Promise<Provider[]> {
    const stub = await getE2EProvidersStub(filters);
    if (stub) {
      return resolveProvidersFromStub(stub, filters);
    }
    return fetchProvidersFromApi(token, filters);
  },

  async getProviderDiagnostic(token: string, id: number | string): Promise<ProviderDiagnostic> {
    return fetchProviderDiagnostic(token, id);
  },

  async getConsumerHistory(
    token: string,
    id: number | string,
    filters?: ConsumerHistoryFilters,
  ): Promise<ConsumerDetail> {
    return fetchConsumerHistory(token, id, filters);
  },
};

