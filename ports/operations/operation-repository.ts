import type { BottleneckType, OperationSummary } from "@/domain/operations/operation-summary";

export interface OperationFilters {
  bottleneck?: BottleneckType;
  q?: string;
  categoryId?: number;
}

export interface OperationRepository {
  getOperations(token: string, filters?: OperationFilters): Promise<OperationSummary[]>;
}
