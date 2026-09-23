import type { OperationSummary } from "@/domain/operations/operation-summary";
import { apiOperationsResponseSchema } from "@/infrastructure/api/types";

export function mapOperations(raw: unknown): OperationSummary[] {
  const parsed = apiOperationsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid operations data");
  }

  const items = Array.isArray(parsed.data)
    ? parsed.data
    : "operations" in parsed.data
      ? parsed.data.operations
      : parsed.data.items;

  return items.map((item) => ({
    id: String(item.id),
    jobRequestId: item.jobRequestId ?? item.job_request_id,
    serviceProposalId: item.serviceProposalId ?? item.service_proposal_id,
    workOrderId: item.workOrderId ?? item.work_order_id,
    consumer: {
      id: item.consumer.id,
      name: item.consumer.name,
      surname: item.consumer.surname,
      email: item.consumer.email,
    },
    provider: {
      id: item.provider.id,
      name: item.provider.name,
      surname: item.provider.surname,
      email: item.provider.email,
    },
    category: {
      id: item.category.id,
      name: item.category.name,
    },
    status: item.status,
    bottleneck: item.bottleneck,
    nextActionBy: item.nextActionBy ?? item.next_action_by ?? "none",
    createdAt: item.createdAt ?? item.created_at ?? "",
    updatedAt: item.updatedAt ?? item.updated_at ?? "",
  }));
}
