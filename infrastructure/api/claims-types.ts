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

export type ApiClaimListItem = z.infer<typeof apiClaimListItemSchema>;
export type ApiClaimsList = z.infer<typeof apiClaimsListSchema>;
