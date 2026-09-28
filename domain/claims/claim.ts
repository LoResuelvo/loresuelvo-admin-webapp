export type ClaimantType = "consumer" | "provider";
export type ClaimStatus = "open" | "in_review" | "resolved" | "dismissed";
export type ClaimUrgency = "high" | "medium" | "low";

export interface Claim {
  id: string;
  createdAt: string;
  operationId: number;
  claimantType: ClaimantType;
  claimantName: string;
  respondentName: string;
  categoryName: string;
  status: ClaimStatus;
  urgency: ClaimUrgency;
}

export interface ClaimFilters {
  status?: ClaimStatus | "";
  q?: string;
  urgency?: ClaimUrgency | "";
}
