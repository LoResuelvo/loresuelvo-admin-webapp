import type { ClaimResolution, ResolutionInput } from "@/domain/claims/claim";
import type { ClaimRepository } from "@/ports/claims/claim-repository";

export async function resolveClaim(
  repository: ClaimRepository,
  token: string,
  id: string,
  data: ResolutionInput,
): Promise<ClaimResolution> {
  return repository.resolveClaim(token, id, data);
}
