import { z } from "zod";

export const apiReviewSummarySchema = z.object({
  work_order_id: z.number().int().positive(),
  consumer_id: z.number().int().positive(),
  provider_id: z.number().int().positive(),
  operation_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  visibility: z.enum(["visible", "hidden"]),
  version: z.number().int().positive(),
  pending_report_count: z.number().int().nonnegative(),
  reported_on: z.string().datetime({ offset: true }).nullable(),
});

export type ApiReviewSummary = z.infer<typeof apiReviewSummarySchema>;

export const apiReviewsPageSchema = z.object({
  items: z.array(apiReviewSummarySchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const apiReviewDetailSchema = z.object({
  review: apiReviewSummarySchema,
  description: z.string(),
  report: z.object({
    id: z.number().int().positive(),
    category: z.string(),
    explanation: z.string(),
    status: z.string(),
    created_on: z.string().datetime({ offset: true }),
  }).nullable(),
  decisions: z.object({
    items: z.array(z.object({
      id: z.number().int().positive(),
      work_order_id: z.number().int().positive(),
      operator_id: z.number().int().positive(),
      action: z.string(),
      category: z.string().nullable(),
      reason: z.string(),
      report_id: z.number().int().positive().nullable(),
      previous_hide_id: z.number().int().positive().nullable(),
      created_on: z.string().datetime({ offset: true }),
    })),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    has_more: z.boolean(),
  }),
});

export const apiReviewModerationResultSchema = z.object({
  work_order_id: z.number().int().positive(),
  visibility: z.enum(["visible", "hidden"]),
  version: z.number().int().positive(),
  decision_id: z.number().int().positive(),
});

export type ApiReviewPage = z.infer<typeof apiReviewsPageSchema>;
export type ApiReviewDetail = z.infer<typeof apiReviewDetailSchema>;
