import { z } from "zod";

export const apiCategoryListItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  enabled: z.boolean(),
  version: z.number().int().positive(),
});

export const apiCategoriesListSchema = z.array(apiCategoryListItemSchema);

export type ApiCategoryListItem = z.infer<typeof apiCategoryListItemSchema>;

export const apiCreateCategoryResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  normalized_name: z.string().trim().min(1).optional(),
});

export type ApiCreateCategoryResponse = z.infer<typeof apiCreateCategoryResponseSchema>;

export const apiCategoryImpactResponseSchema = z.object({
  category: apiCategoryListItemSchema,
  observed_at: z.string().datetime({ offset: true }),
  counts: z.object({
    assigned_providers: z.number().int().nonnegative(),
    pending_requests: z.number().int().nonnegative(),
    accepted_requests_without_proposal: z.number().int().nonnegative(),
    pending_proposals: z.number().int().nonnegative(),
    scheduled_orders: z.number().int().nonnegative(),
    awaiting_payment_orders: z.number().int().nonnegative(),
  }),
  has_ongoing_orders: z.boolean(),
  requires_confirmation: z.boolean(),
  existing_operations_can_continue: z.boolean(),
});

export type ApiCategoryImpactResponse = z.infer<typeof apiCategoryImpactResponseSchema>;
