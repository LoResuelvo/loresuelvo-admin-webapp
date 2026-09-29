export type ClaimantType = "consumer" | "provider";
export type ClaimStatus = "open" | "in_review" | "resolved" | "dismissed";
export type ClaimUrgency = "high" | "medium" | "low";
export type ResolutionType =
  | "favor_consumer"
  | "favor_provider"
  | "mutual_agreement"
  | "dismissed";

export interface ResolutionInput {
  resolutionType: ResolutionType;
  reason: string;
  compensationAmountCents?: number | null;
}

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

export interface ClaimResolution {
  resolutionType: string;
  reason: string;
  compensationAmountCents?: number | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
}

export interface ClaimDetails extends Claim {
  claimReason: string;
  description: string;
  evidencePhotoUrls: readonly string[];
  resolution?: ClaimResolution | null;
}
