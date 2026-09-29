import "server-only";
import type { Claim, ClaimDetails, ClaimFilters } from "@/domain/claims/claim";
import { ClaimError } from "@/domain/claims/claim-error";
import type { ClaimRepository } from "@/ports/claims/claim-repository";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapClaimsList, mapClaimDetails } from "./claim-mapper";

async function getE2EClaimsStub(filters?: ClaimFilters): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());

    if (filters?.status) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          s.endpoint.includes(`status=${encodeURIComponent(filters.status!)}`),
      );
      if (match) return match;
    }

    if (filters?.q) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          s.endpoint.includes(`q=${encodeURIComponent(filters.q!)}`),
      );
      if (match) return match;
    }

    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === "/admin/claims" ||
            s.endpoint === "/claims" ||
            s.endpoint.startsWith("/admin/claims?") ||
            s.endpoint.startsWith("/claims?")),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function resolveClaimsFromStub(
  stub: ApiStub,
  filters?: ClaimFilters,
): Promise<Claim[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new ClaimError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new ClaimError("unavailable", `Failed to fetch claims: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new ClaimError("unknown", `Failed to fetch claims: ${stub.status}`);
  }

  let result = mapClaimsList(stub.body);

  if (filters?.status) {
    result = result.filter((c) => c.status === filters.status);
  }
  if (filters?.q) {
    const query = filters.q.toLowerCase().trim();
    result = result.filter(
      (c) =>
        c.claimantName.toLowerCase().includes(query) ||
        c.respondentName.toLowerCase().includes(query),
    );
  }
  if (filters?.urgency) {
    result = result.filter((c) => c.urgency === filters.urgency);
  }

  return result;
}

function buildApiUrl(baseUrl: string, filters?: ClaimFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/claims`);
  if (filters?.status) url.searchParams.set("status", filters.status);
  if (filters?.q) url.searchParams.set("q", filters.q);
  if (filters?.urgency) url.searchParams.set("urgency", filters.urgency);
  return url;
}

async function getE2EClaimDetailStub(id: string): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === `/admin/claims/${id}` || s.endpoint === `/claims/${id}`),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function resolveClaimDetailFromStub(stub: ApiStub): Promise<ClaimDetails> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new ClaimError("forbidden", "Forbidden");
  }
  if (stub.status === 404) {
    throw new ClaimError("notFound", "Claim not found");
  }
  if (stub.status >= 500) {
    throw new ClaimError("unavailable", `Failed to fetch claim detail: ${stub.status}`);
  }
  if (stub.status >= 400) {
    throw new ClaimError("unknown", `Failed to fetch claim detail: ${stub.status}`);
  }

  return mapClaimDetails(stub.body);
}

async function fetchClaimDetailFromApi(token: string, id: string): Promise<ClaimDetails> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = `${baseUrl.replace(/\/$/, "")}/admin/claims/${encodeURIComponent(id)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err: unknown) {
    if (err instanceof ClaimError) throw err;
    throw new ClaimError("unavailable", "Network error when fetching claim detail");
  }

  if (response.status === 403) {
    throw new ClaimError("forbidden", "Forbidden");
  }
  if (response.status === 404) {
    throw new ClaimError("notFound", "Claim not found");
  }
  if (response.status >= 500) {
    throw new ClaimError("unavailable", `Failed to fetch claim detail: ${response.status}`);
  }
  if (!response.ok) {
    throw new ClaimError("unknown", `Failed to fetch claim detail: ${response.status}`);
  }

  const data = await response.json();
  return mapClaimDetails(data);
}

export const apiClaimRepository: ClaimRepository = {
  async getClaims(token: string, filters?: ClaimFilters): Promise<Claim[]> {
    const stub = await getE2EClaimsStub(filters);
    if (stub) {
      return resolveClaimsFromStub(stub, filters);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const url = buildApiUrl(baseUrl, filters);
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 403) {
      throw new ClaimError("forbidden", "Forbidden");
    }
    if (response.status >= 500) {
      throw new ClaimError("unavailable", `Failed to fetch claims: ${response.status}`);
    }
    if (!response.ok) {
      throw new ClaimError("unknown", `Failed to fetch claims: ${response.status}`);
    }

    const data = await response.json();
    return mapClaimsList(data);
  },

  async getClaimById(token: string, id: string): Promise<ClaimDetails> {
    const stub = await getE2EClaimDetailStub(id);
    if (stub) {
      return resolveClaimDetailFromStub(stub);
    }
    return fetchClaimDetailFromApi(token, id);
  },
};

