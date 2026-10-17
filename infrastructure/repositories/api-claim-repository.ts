import "server-only";
import type { ClaimFilters } from "@/domain/claims/claim";
import type { ClaimRepository } from "@/ports/claims/claim-repository";
import { mapClaimsList, mapClaimDetails, mapClaimResolution, mapResolutionInputToApi } from "./claim-mapper";
import { requestClaimApi } from "./claim-api-request";
import { getE2EClaimsStub, resolveClaimsFromStub, getE2EClaimDetailStub, resolveClaimDetailFromStub, getE2EResolveClaimStub, resolveClaimFromStub } from "./claim-stubs";

function claimQuery(filters?: ClaimFilters): string {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.q) params.set("q", filters.q);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));
  return params.size ? `?${params}` : "";
}

export const apiClaimRepository: ClaimRepository = {
  async getClaims(token, filters) {
    const stub = await getE2EClaimsStub(filters);
    return stub ? resolveClaimsFromStub(stub, filters) : mapClaimsList(await requestClaimApi(token, claimQuery(filters)));
  },

  async getClaimById(token, id) {
    const stub = await getE2EClaimDetailStub(id);
    return stub ? resolveClaimDetailFromStub(stub) : mapClaimDetails(await requestClaimApi(token, `/${encodeURIComponent(id)}`));
  },

  async resolveClaim(token, id, data) {
    const body = mapResolutionInputToApi(data);
    const stub = await getE2EResolveClaimStub(id);
    if (stub) return resolveClaimFromStub(stub);
    const path = `/${encodeURIComponent(id)}`;
    const detail = mapClaimDetails(await requestClaimApi(token, path));
    // The API permits resolution only after review has started.
    if (detail.status === "open") {
      await requestClaimApi(token, `${path}/review`, { method: "POST", idempotencyKey: data.reviewIdempotencyKey ?? crypto.randomUUID() });
    }
    const result = await requestClaimApi(token, `${path}/resolution`, {
      method: "POST", body, idempotencyKey: data.idempotencyKey ?? crypto.randomUUID(),
    });
    return mapClaimResolution(result);
  },
};
