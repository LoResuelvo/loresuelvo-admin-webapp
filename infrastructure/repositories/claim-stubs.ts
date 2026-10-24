import type { ClaimPage, ClaimDetails, ClaimFilters, ClaimResolution } from "@/domain/claims/claim";
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

    const candidates = stubs.filter(stub => stub.method === "GET" && new URL(stub.endpoint, "http://stub.local").pathname === "/admin/claims");
    return candidates.find(stub => {
      const params = new URL(stub.endpoint, "http://stub.local").searchParams;
      return params.get("status") === (filters?.status || null)
        && params.get("q") === (filters?.q || null)
        && Number(params.get("page") ?? 1) === (filters?.page ?? 1)
        && Number(params.get("limit") ?? 20) === (filters?.limit ?? 20);
    }) ?? candidates.find(stub => !stub.endpoint.includes("?")) ?? null;
  } catch {
    return null;
  }
}

export async function resolveClaimsFromStub(
  stub: ApiStub,
  filters?: ClaimFilters,
): Promise<ClaimPage> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new ClaimError("forbidden", "Forbidden");
  if (stub.status >= 500) throw new ClaimError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ClaimError("unknown", `Failed: ${stub.status}`);

  const page = mapClaimsList(stub.body);
  if (stub.endpoint.includes("?")) return page;
  let result = page.items;
  if (filters?.status) result = result.filter((c) => c.status === filters.status);
  if (filters?.q) {
    const query = filters.q.trim();
    const q = query.toLowerCase();
    result = result.filter(
      (c) => (c.claimantEmail ?? c.claimantName).toLowerCase().includes(q)
        || String(c.operationId) === query,
    );
  }

  const pageNumber = filters?.page ?? page.page;
  const limit = filters?.limit ?? page.limit;
  return { items: result.slice((pageNumber - 1) * limit, pageNumber * limit), page: pageNumber, limit, total: result.length };
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
