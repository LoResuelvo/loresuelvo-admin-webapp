import { z } from "zod";

export const apiClaimListItemSchema = z.object({
  id: z.string().min(1),
  created_at: z.string(),
  operation_id: z.number().int().positive(),
  claimant_type: z.enum(["consumer", "provider"]),
  claimant_name: z.string(),
  respondent_name: z.string(),
  category_name: z.string(),
  status: z.enum(["open", "in_review", "resolved", "dismissed"]),
  urgency: z.enum(["high", "medium", "low"]),
});

export const apiClaimsListSchema = z.array(apiClaimListItemSchema);

export const apiClaimResolutionSchema = z.object({
  resolution_type: z.string(),
  reason: z.string(),
  compensation_amount_cents: z.number().nullable().optional(),
  resolved_by: z.string().nullable().optional(),
  resolved_at: z.string().nullable().optional(),
});

export const apiClaimDetailSchema = apiClaimListItemSchema.extend({
  claim_reason: z.string(),
  description: z.string(),
  evidence_photo_urls: z.array(z.string()),
  resolution: apiClaimResolutionSchema.nullable().optional(),
});

export type ApiClaimListItem = z.infer<typeof apiClaimListItemSchema>;
export type ApiClaimsList = z.infer<typeof apiClaimsListSchema>;
export type ApiClaimResolution = z.infer<typeof apiClaimResolutionSchema>;
export type ApiClaimDetail = z.infer<typeof apiClaimDetailSchema>;
