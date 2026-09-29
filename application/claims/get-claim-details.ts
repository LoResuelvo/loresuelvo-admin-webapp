import type { ClaimDetails } from "@/domain/claims/claim";
import type { ClaimRepository } from "@/ports/claims/claim-repository";

export async function getClaimDetails(
  repository: ClaimRepository,
  token: string,
  id: string,
): Promise<ClaimDetails> {
  return repository.getClaimById(token, id);
}
