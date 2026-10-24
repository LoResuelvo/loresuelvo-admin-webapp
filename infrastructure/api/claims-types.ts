import { z } from "zod";

const status = z.enum(["open", "in_review", "resolved", "dismissed"]);
const party = z.enum(["consumer", "provider"]);
const operationId = z.string().regex(/^(jr|sp)-[1-9][0-9]*$/);
const summary = z.object({
  id: z.number().int().positive(),
  created_on: z.string(),
  operation_id: operationId,
  status,
  reason: z.string(),
});
export const apiClaimListItemSchema = summary.extend({
  claimant_id: z.number().int().positive(),
  claimant_party: party,
  claimant_email: z.email(),
  claimant_name: z.string().nullish(),
  category_id: z.number().int().positive().nullable(),
  category_name: z.string().nullable(),
  age_seconds: z.number().nonnegative(),
});
export const apiClaimsListSchema = z.object({
  items: z.array(apiClaimListItemSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export const apiResolutionInputSchema = z.object({
  type: z.enum(["consumer_favor", "provider_favor", "agreement", "without_merit"]),
  reasoning: z.string().trim().min(1).refine(value => Array.from(value).length <= 5000 && !value.includes("\0")),
  suggested_compensation: z.object({ amount_minor: z.number().int().positive().safe() }).optional(),
});
export const apiClaimResolutionSchema = z.object({
  type: apiResolutionInputSchema.shape.type,
  reasoning: z.string(),
  resolved_on: z.string(),
  suggested_compensation: z.object({ amount_minor: z.number().int().positive().safe(), currency: z.literal("ARS"), unit: z.literal("minor") }).nullable(),
});
export const apiClaimDetailSchema = summary.extend({
  claimant: z.object({ id: z.number().int().positive(), party, name: z.string().nullish(), email: z.email() }),
  respondent: z.object({ id: z.number().int().positive(), party, name: z.string().nullish(), email: z.email() }).nullish(),
  category_id: z.number().int().positive().nullable(),
  category_name: z.string().nullable(),
  description: z.string(),
  images: z.array(z.object({ file_id: z.string(), url: z.url() })),
  resolution: apiClaimResolutionSchema.nullable(),
});
export type ApiClaimListItem = z.infer<typeof apiClaimListItemSchema>;
export type ApiClaimsList = z.infer<typeof apiClaimsListSchema>;
export type ApiClaimResolution = z.infer<typeof apiClaimResolutionSchema>;
export type ApiClaimDetail = z.infer<typeof apiClaimDetailSchema>;
export type ApiResolutionInput = z.infer<typeof apiResolutionInputSchema>;
