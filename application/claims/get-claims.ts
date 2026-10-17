import type { ClaimPage, ClaimFilters } from "@/domain/claims/claim";
import type { ClaimRepository } from "@/ports/claims/claim-repository";

export async function getClaims(
  repository: ClaimRepository,
  token: string,
  filters?: ClaimFilters,
): Promise<ClaimPage> {
  return repository.getClaims(token, filters);
}
