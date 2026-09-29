import type { Claim, ClaimDetails, ClaimFilters, ClaimResolution } from "@/domain/claims/claim";
import { ClaimError } from "@/domain/claims/claim-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapClaimsList, mapClaimDetails, mapClaimResolution } from "./claim-mapper";

export async function getE2EClaimsStub(filters?: ClaimFilters): Promise<ApiStub | null> {
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

export async function resolveClaimsFromStub(
  stub: ApiStub,
  filters?: ClaimFilters,
): Promise<Claim[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new ClaimError("forbidden", "Forbidden");
  if (stub.status >= 500) throw new ClaimError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ClaimError("unknown", `Failed: ${stub.status}`);

  let result = mapClaimsList(stub.body);
  if (filters?.status) result = result.filter((c) => c.status === filters.status);
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (c) => c.claimantName.toLowerCase().includes(q) || c.respondentName.toLowerCase().includes(q),
    );
  }
  if (filters?.urgency) result = result.filter((c) => c.urgency === filters.urgency);
  return result;
}

export async function getE2EClaimDetailStub(id: string): Promise<ApiStub | null> {
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

export async function resolveClaimDetailFromStub(stub: ApiStub): Promise<ClaimDetails> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new ClaimError("forbidden", "Forbidden");
  if (stub.status === 404) throw new ClaimError("notFound", "Claim not found");
  if (stub.status >= 500) throw new ClaimError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ClaimError("unknown", `Failed: ${stub.status}`);

  return mapClaimDetails(stub.body);
}

export async function getE2EResolveClaimStub(id: string): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return (
      stubs.find(
        (s) =>
          s.method === "POST" &&
          (s.endpoint === `/admin/claims/${id}/resolution` ||
            s.endpoint === `/claims/${id}/resolution`),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export async function resolveClaimFromStub(stub: ApiStub): Promise<ClaimResolution> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new ClaimError("forbidden", "Forbidden");
  if (stub.status === 404) throw new ClaimError("notFound", "Claim not found");
  if (stub.status >= 500) throw new ClaimError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ClaimError("unknown", `Failed: ${stub.status}`);

  return mapClaimResolution(stub.body);
}
