import type { BottleneckType, OperationPage } from "@/domain/operations/operation-summary";
import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";

export interface OperationFilters {
  bottleneck?: BottleneckType;
  q?: string;
  categoryId?: number;
  cursor?: string;
  limit?: number;
}

export interface OperationRepository {
  getOperations(token: string, filters?: OperationFilters): Promise<OperationPage>;
  getOperationById(token: string, id: string): Promise<UnifiedOperationDetail>;
  getAuditedConversation(
    token: string,
    operationId: string,
    reason: string,
    cursor?: string,
  ): Promise<AuditedConversationResult>;
}

