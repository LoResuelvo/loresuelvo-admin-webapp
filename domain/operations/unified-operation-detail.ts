import type { OperationStatus } from "./operation-summary";

export interface OperationPartyDetail {
  readonly id: number;
  readonly name: string;
  readonly surname: string;
  readonly email?: string | null;
  readonly profilePhotoUrl?: string | null;
}

export interface TimelineMilestone {
  readonly type: string;
  readonly title: string;
  readonly timestamp: string;
}

export interface RequestDetail {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly sourceAssessmentId?: string | null;
  readonly diagnosticSummary?: string | null;
  readonly photos: readonly string[];
}

export interface ProposalDetail {
  readonly id: number;
  readonly amountCents: number;
  readonly bookingDepositCents: number;
  readonly estimatedDuration: string;
  readonly estimatedDurationMinutes?: number;
  readonly scheduledFor?: string;
  readonly description: string;
  readonly status: string;
  readonly createdAt: string;
}

export interface CompletionReport {
  readonly completedAt: string;
  readonly notes: string;
  readonly photos: readonly string[];
}

export interface ServiceReview {
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: string | null;
}

export interface OrderDetail {
  readonly id: number;
  readonly status: string;
  readonly scheduledFor?: string | null;
  readonly completionReport?: CompletionReport | null;
  readonly review?: ServiceReview | null;
}

export interface UnifiedOperationDetail {
  readonly id: string;
  readonly status: OperationStatus | null;
  readonly createdAt: string;
  readonly category: { readonly id: number; readonly name: string } | null;
  readonly consumer: OperationPartyDetail;
  readonly provider: OperationPartyDetail;
  readonly currentAddress: string | null;
  readonly request: RequestDetail | null;
  readonly proposals: readonly ProposalDetail[];
  readonly relatedProposals?: readonly (ProposalDetail & { readonly operationId: string })[];
  readonly order?: OrderDetail | null;
  readonly paymentMilestones?: unknown;
  readonly timeline: readonly TimelineMilestone[];
}
