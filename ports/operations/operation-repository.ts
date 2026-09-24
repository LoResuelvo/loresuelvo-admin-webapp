import type { BottleneckType, OperationSummary } from "@/domain/operations/operation-summary";
import type { UnifiedOperationDetail } from "@/domain/operations/unified-operation-detail";
import type { AuditedConversationResult } from "@/domain/operations/audited-message";

export interface OperationFilters {
  bottleneck?: BottleneckType;
  q?: string;
  categoryId?: number;
}

export interface OperationRepository {
  getOperations(token: string, filters?: OperationFilters): Promise<OperationSummary[]>;
  getOperationById(token: string, id: string): Promise<UnifiedOperationDetail>;
  getAuditedConversation?(
    token: string,
    operationId: string,
    reason: string,
  ): Promise<AuditedConversationResult>;
}

