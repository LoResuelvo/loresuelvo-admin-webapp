import "server-only";
import type {
  Claim,
  ClaimDetails,
  ClaimFilters,
  ClaimResolution,
  ResolutionInput,
} from "@/domain/claims/claim";
import { ClaimError } from "@/domain/claims/claim-error";
import type { ClaimRepository } from "@/ports/claims/claim-repository";
import { mapClaimsList, mapClaimDetails, mapClaimResolution, mapResolutionInputToApi } from "./claim-mapper";
import {
  getE2EClaimsStub,
  resolveClaimsFromStub,
  getE2EClaimDetailStub,
  resolveClaimDetailFromStub,
  getE2EResolveClaimStub,
  resolveClaimFromStub,
} from "./claim-stubs";

function buildApiUrl(baseUrl: string, filters?: ClaimFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/claims`);
  if (filters?.status) url.searchParams.set("status", filters.status);
  if (filters?.q) url.searchParams.set("q", filters.q);
  if (filters?.urgency) url.searchParams.set("urgency", filters.urgency);
  return url;
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

  if (response.status === 403) throw new ClaimError("forbidden", "Forbidden");
  if (response.status === 404) throw new ClaimError("notFound", "Claim not found");
  if (response.status >= 500) throw new ClaimError("unavailable", `Failed: ${response.status}`);
  if (!response.ok) throw new ClaimError("unknown", `Failed: ${response.status}`);

  const data = await response.json();
  return mapClaimDetails(data);
}

async function fetchResolveClaimFromApi(
  token: string,
  id: string,
  data: ResolutionInput,
): Promise<ClaimResolution> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not configured");
  }

  const url = `${baseUrl.replace(/\/$/, "")}/admin/claims/${encodeURIComponent(id)}/resolution`;
  const body = mapResolutionInputToApi(data);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err: unknown) {
    if (err instanceof ClaimError) throw err;
    throw new ClaimError("unavailable", "Network error when resolving claim");
  }

  if (response.status === 403) throw new ClaimError("forbidden", "Forbidden");
  if (response.status === 404) throw new ClaimError("notFound", "Claim not found");
  if (response.status >= 500) throw new ClaimError("unavailable", `Failed: ${response.status}`);
  if (!response.ok) throw new ClaimError("unknown", `Failed: ${response.status}`);

  const resData = await response.json();
  return mapClaimResolution(resData);
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

    if (response.status === 403) throw new ClaimError("forbidden", "Forbidden");
    if (response.status >= 500) throw new ClaimError("unavailable", `Failed: ${response.status}`);
    if (!response.ok) throw new ClaimError("unknown", `Failed: ${response.status}`);

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

  async resolveClaim(token: string, id: string, data: ResolutionInput): Promise<ClaimResolution> {
    const stub = await getE2EResolveClaimStub(id);
    if (stub) {
      return resolveClaimFromStub(stub);
    }
    return fetchResolveClaimFromApi(token, id, data);
  },
};
