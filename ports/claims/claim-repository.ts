import type { Claim, ClaimDetails, ClaimFilters } from "@/domain/claims/claim";

export interface ClaimRepository {
  getClaims(token: string, filters?: ClaimFilters): Promise<Claim[]>;
  getClaimById(token: string, id: string): Promise<ClaimDetails>;
}
