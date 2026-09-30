import type { OperationSummary } from "./operation-summary";

/** The approved inbox filter uses 24 hours; the API stalled alert uses 72. */
export function hasPendingAdvanceOver24Hours(operation: OperationSummary, now: number): boolean {
  if (operation.updatedAt === null) return false;
  const pendingStages = ["request_pending", "proposal_pending", "work_order_awaiting_payment"];
  return pendingStages.includes(operation.status)
    && now - Date.parse(operation.updatedAt) > 24 * 60 * 60 * 1000;
}
