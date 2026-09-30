import type { AuditedConversationResult } from "@/domain/operations/audited-message";
import type { OperationRepository } from "@/ports/operations/operation-repository";

export async function getAuditedConversation(
  repository: OperationRepository,
  token: string,
  operationId: string,
  reason: string,
  cursor?: string,
): Promise<AuditedConversationResult> {
  return cursor
    ? repository.getAuditedConversation(token, operationId, reason, cursor)
    : repository.getAuditedConversation(token, operationId, reason);
}
