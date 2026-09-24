import { z } from "zod";

export const apiCategoryListItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  enabled: z.boolean().optional(),
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
  category_id: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  category_name: z.string().trim().min(1).optional(),
  categoryName: z.string().trim().min(1).optional(),
  provider_count: z.number().int().nonnegative().optional(),
  providerCount: z.number().int().nonnegative().optional(),
  active_orders_count: z.number().int().nonnegative().optional(),
  activeOrdersCount: z.number().int().nonnegative().optional(),
  can_deactivate: z.boolean().optional(),
  canDeactivate: z.boolean().optional(),
});

export type ApiCategoryImpactResponse = z.infer<typeof apiCategoryImpactResponseSchema>;
