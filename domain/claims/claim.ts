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
  idempotencyKey?: string;
  reviewIdempotencyKey?: string;
}

export interface Claim {
  id: string;
  createdAt: string;
  operationId: string | number;
  claimantType: ClaimantType;
  claimantId?: number;
  claimantName: string;
  claimantEmail?: string;
  respondentId?: number;
  respondentType?: ClaimantType;
  respondentName?: string;
  respondentEmail?: string;
  categoryName?: string;
  status: ClaimStatus;
  urgency?: ClaimUrgency;
}

export interface ClaimFilters {
  status?: ClaimStatus | "";
  q?: string;
  page?: number;
  limit?: number;
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

export function applyClaimResolution(claim: ClaimDetails, resolution: ClaimResolution): ClaimDetails {
  return { ...claim, status: resolution.resolutionType === "dismissed" ? "dismissed" : "resolved", resolution };
}

export interface ClaimPage {
  items: Claim[];
  page: number;
  limit: number;
  total: number;
}
