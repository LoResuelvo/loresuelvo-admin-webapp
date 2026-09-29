import { z } from "zod";

export const apiReviewModerationItemSchema = z.object({
  id: z.string().min(1),
  created_at: z.string(),
  operation_id: z.number().int().positive(),
  author_name: z.string(),
  provider_name: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  status: z.enum(["visible", "hidden", "reported"]),
  report_reason: z.string().nullable().optional(),
  moderation: z
    .object({
      moderated_by: z.string(),
      moderated_at: z.string(),
      category: z.enum(["abusive_language", "personal_data", "spam", "off_topic"]),
      reason: z.string(),
    })
    .nullable()
    .optional(),
});

export type ApiReviewModerationItem = z.infer<typeof apiReviewModerationItemSchema>;
export const apiReviewsListSchema = z.array(apiReviewModerationItemSchema);
