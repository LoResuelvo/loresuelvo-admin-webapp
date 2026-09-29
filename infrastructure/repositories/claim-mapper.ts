import type {
  Claim,
  ClaimDetails,
  ClaimResolution,
  ResolutionInput,
} from "@/domain/claims/claim";
import {
  apiClaimListItemSchema,
  apiClaimsListSchema,
  apiClaimDetailSchema,
  apiClaimResolutionSchema,
  apiResolutionInputSchema,
  type ApiResolutionInput,
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

export function mapClaimResolution(value: unknown): ClaimResolution {
  const target =
    value && typeof value === "object" && "resolution" in value && (value as Record<string, unknown>).resolution
      ? (value as Record<string, unknown>).resolution
      : value;
  const parsed = apiClaimResolutionSchema.safeParse(target);
  if (!parsed.success) {
    throw new Error("Invalid claim resolution data");
  }
  return {
    resolutionType: parsed.data.resolution_type,
    reason: parsed.data.reason,
    compensationAmountCents: parsed.data.compensation_amount_cents ?? null,
    resolvedBy: parsed.data.resolved_by ?? null,
    resolvedAt: parsed.data.resolved_at ?? null,
  };
}

export function mapResolutionInputToApi(input: ResolutionInput): ApiResolutionInput {
  const parsed = apiResolutionInputSchema.safeParse({
    resolution_type: input.resolutionType,
    reason: input.reason,
    compensation_amount_cents: input.compensationAmountCents,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid resolution input");
  }
  return parsed.data;
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
    resolution: parsed.data.resolution ? mapClaimResolution(parsed.data.resolution) : null,
  };
}
