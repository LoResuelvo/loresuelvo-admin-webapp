import type { OperationSummary } from "@/domain/operations/operation-summary";
import type { OperationFilters, OperationRepository } from "@/ports/operations/operation-repository";

export async function getOperations(
  repository: OperationRepository,
  token: string,
  filters?: OperationFilters,
): Promise<OperationSummary[]> {
  return repository.getOperations(token, filters);
}
