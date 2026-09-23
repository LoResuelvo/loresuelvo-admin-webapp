import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import type { OperationRepository } from "@/ports/operations/operation-repository";

export async function getOperationDetail(
  repository: OperationRepository,
  token: string,
  id: string,
): Promise<UnifiedOperationDetail> {
  return repository.getOperationById(token, id);
}
