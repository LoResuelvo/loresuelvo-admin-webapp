import type { Claim, ClaimDetails, ClaimPage, ClaimResolution, ResolutionInput, ResolutionType } from "@/domain/claims/claim";
import { apiClaimListItemSchema, apiClaimsListSchema, apiClaimDetailSchema, apiClaimResolutionSchema, apiResolutionInputSchema, type ApiResolutionInput } from "@/infrastructure/api/types";

const resolutionTypes = { favor_consumer: "consumer_favor", favor_provider: "provider_favor", mutual_agreement: "agreement", dismissed: "without_merit" } as const;
const domainResolutionTypes: Record<string, ResolutionType> = { consumer_favor: "favor_consumer", provider_favor: "favor_provider", agreement: "mutual_agreement", without_merit: "dismissed" };

function participantName(name: string | null | undefined, email: string): string {
  return name?.trim() || email;
}

export function mapClaimListItem(value: unknown): Claim {
  const dto = apiClaimListItemSchema.parse(value);
  return {
    id: String(dto.id),
    createdAt: dto.created_on,
    operationId: dto.operation_id,
    claimantType: dto.claimant_party,
    claimantId: dto.claimant_id,
    claimantName: participantName(dto.claimant_name, dto.claimant_email),
    claimantEmail: dto.claimant_email,
    categoryName: dto.category_name ?? undefined,
    status: dto.status,
  };
}

export function mapClaimsList(value: unknown): ClaimPage {
  const dto = apiClaimsListSchema.parse(value);
  return { items: dto.items.map(mapClaimListItem), page: dto.page, limit: dto.limit, total: dto.total };
}

export function mapClaimResolution(value: unknown): ClaimResolution {
  const target = value && typeof value === "object" && "resolution" in value ? value.resolution : value;
  const dto = apiClaimResolutionSchema.parse(target);
  return { resolutionType: domainResolutionTypes[dto.type], reason: dto.reasoning,
    compensationAmountCents: dto.suggested_compensation?.amount_minor ?? null, resolvedAt: dto.resolved_on };
}

export function mapResolutionInputToApi(input: ResolutionInput): ApiResolutionInput {
  return apiResolutionInputSchema.parse({ type: resolutionTypes[input.resolutionType], reasoning: input.reason,
    ...(input.compensationAmountCents != null ? { suggested_compensation: { amount_minor: input.compensationAmountCents } } : {}) });
}

export function mapClaimDetails(value: unknown): ClaimDetails {
  const dto = apiClaimDetailSchema.parse(value);
  return {
    id: String(dto.id),
    createdAt: dto.created_on,
    operationId: dto.operation_id,
    claimantType: dto.claimant.party,
    claimantId: dto.claimant.id,
    claimantName: participantName(dto.claimant.name, dto.claimant.email),
    claimantEmail: dto.claimant.email,
    ...(dto.respondent ? {
      respondentId: dto.respondent.id,
      respondentType: dto.respondent.party,
      respondentName: participantName(dto.respondent.name, dto.respondent.email),
      respondentEmail: dto.respondent.email,
    } : {}),
    categoryName: dto.category_name ?? undefined,
    status: dto.status,
    claimReason: dto.reason,
    description: dto.description,
    evidencePhotoUrls: dto.images.map(image => image.url),
    resolution: dto.resolution ? mapClaimResolution(dto.resolution) : null,
  };
}
