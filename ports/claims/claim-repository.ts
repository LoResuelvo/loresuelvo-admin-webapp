import type { Claim, ClaimFilters } from "@/domain/claims/claim";

export interface ClaimRepository {
  getClaims(token: string, filters?: ClaimFilters): Promise<Claim[]>;
}
