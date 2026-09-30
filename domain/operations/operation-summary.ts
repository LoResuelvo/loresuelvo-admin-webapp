export type BottleneckType =
  | "pending_proposal_24h"
  | "pending_booking_deposit"
  | "scheduled_today"
  | "delayed_service"
  | "pending_final_payment"
  | "stalled"
  | "none";

export type ActionResponsible = "consumer" | "provider" | "platform" | "none";

export type OperationStage = "request_pending" | "request_accepted" | "proposal_pending" | "proposal_accepted" | "proposal_rejected" | "work_order_scheduled" | "work_order_awaiting_payment" | "work_order_paid";
export type OperationAlert = "request_pending_over_24h" | "booking_deadline_passed" | "delayed" | "stalled";
export interface OperationPage { readonly operations: OperationSummary[]; readonly nextCursor: string | null; }

export type OperationStatus = OperationStage | "requested" | "quoted" | "in_progress" | "completed" | "cancelled";

export interface OperationParty {
  readonly id: number;
  readonly name: string;
  readonly surname: string;
  readonly email?: string | null;
}

export interface OperationSummary {
  readonly id: string;
  readonly jobRequestId?: number;
  readonly serviceProposalId?: number;
  readonly workOrderId?: number;
  readonly consumer: OperationParty;
  readonly provider: OperationParty;
  readonly category: { readonly id: number; readonly name: string } | null;
  readonly status: OperationStatus;
  readonly bottleneck?: BottleneckType;
  readonly nextActionBy: ActionResponsible | null;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly alerts?: readonly OperationAlert[];
}
