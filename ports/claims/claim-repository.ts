import type {
  Claim,
  ClaimDetails,
  ClaimFilters,
  ClaimResolution,
  ResolutionInput,
} from "@/domain/claims/claim";

export interface ClaimRepository {
  getClaims(token: string, filters?: ClaimFilters): Promise<Claim[]>;
  getClaimById(token: string, id: string): Promise<ClaimDetails>;
  resolveClaim(token: string, id: string, data: ResolutionInput): Promise<ClaimResolution>;
}
