export type BottleneckType =
  | "pending_proposal_24h"
  | "pending_booking_deposit"
  | "scheduled_today"
  | "delayed_service"
  | "pending_final_payment"
  | "stalled"
  | "none";

export type ActionResponsible = "consumer" | "provider" | "platform" | "none";

export type OperationStatus = "requested" | "quoted" | "in_progress" | "completed" | "cancelled";

export interface OperationParty {
  readonly id: number;
  readonly name: string;
  readonly surname: string;
  readonly email: string;
}

export interface OperationSummary {
  readonly id: string;
  readonly jobRequestId?: number;
  readonly serviceProposalId?: number;
  readonly workOrderId?: number;
  readonly consumer: OperationParty;
  readonly provider: OperationParty;
  readonly category: { readonly id: number; readonly name: string };
  readonly status: OperationStatus;
  readonly bottleneck: BottleneckType;
  readonly nextActionBy: ActionResponsible;
  readonly createdAt: string;
  readonly updatedAt: string;
}
