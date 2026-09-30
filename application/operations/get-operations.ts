import type { OperationPage } from "@/domain/operations/operation-summary";
import type { OperationFilters, OperationRepository } from "@/ports/operations/operation-repository";

export async function getOperations(
  repository: OperationRepository,
  token: string,
  filters?: OperationFilters,
): Promise<OperationPage> {
  return repository.getOperations(token, filters);
}
