import type { Claim, ClaimDetails } from "@/domain/claims/claim";
import {
  apiClaimListItemSchema,
  apiClaimsListSchema,
  apiClaimDetailSchema,
} from "@/infrastructure/api/types";

export function mapClaimListItem(value: unknown): Claim {
  const parsed = apiClaimListItemSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid claim data");
  }
  return {
    id: parsed.data.id,
    createdAt: parsed.data.created_at,
    operationId: parsed.data.operation_id,
    claimantType: parsed.data.claimant_type,
    claimantName: parsed.data.claimant_name,
    respondentName: parsed.data.respondent_name,
    categoryName: parsed.data.category_name,
    status: parsed.data.status,
    urgency: parsed.data.urgency,
  };
}

export function mapClaimsList(value: unknown): Claim[] {
  const parsed = apiClaimsListSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid claims list data");
  }
  return parsed.data.map((item) => ({
    id: item.id,
    createdAt: item.created_at,
    operationId: item.operation_id,
    claimantType: item.claimant_type,
    claimantName: item.claimant_name,
    respondentName: item.respondent_name,
    categoryName: item.category_name,
    status: item.status,
    urgency: item.urgency,
  }));
}

export function mapClaimDetails(value: unknown): ClaimDetails {
  const parsed = apiClaimDetailSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error("Invalid claim detail data");
  }
  return {
    id: parsed.data.id,
    createdAt: parsed.data.created_at,
    operationId: parsed.data.operation_id,
    claimantType: parsed.data.claimant_type,
    claimantName: parsed.data.claimant_name,
    respondentName: parsed.data.respondent_name,
    categoryName: parsed.data.category_name,
    status: parsed.data.status,
    urgency: parsed.data.urgency,
    claimReason: parsed.data.claim_reason,
    description: parsed.data.description,
    evidencePhotoUrls: parsed.data.evidence_photo_urls,
    resolution: parsed.data.resolution
      ? {
          resolutionType: parsed.data.resolution.resolution_type,
          reason: parsed.data.resolution.reason,
          compensationAmountCents: parsed.data.resolution.compensation_amount_cents ?? null,
          resolvedBy: parsed.data.resolution.resolved_by ?? null,
          resolvedAt: parsed.data.resolution.resolved_at ?? null,
        }
      : null,
  };
}

