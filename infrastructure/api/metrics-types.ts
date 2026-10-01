import { z } from "zod";

const numericOrNull = z
  .union([z.number(), z.string().transform((v) => Number(v))])
  .nullable()
  .optional();

export const apiFunnelPeriodSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const apiFunnelStageSchema = z.object({
  stage: z.string(),
  count: z.number().int().nonnegative(),
  conversion_percentage: numericOrNull,
});

export const apiFunnelDelaySchema = z.object({
  observations: z.number().int().nonnegative(),
  mean_seconds: numericOrNull,
});

export const apiFunnelDelaysSchema = z.object({
  request_to_first_proposal: apiFunnelDelaySchema,
  proposal_to_confirmed_hiring: apiFunnelDelaySchema,
  confirmed_hiring_to_reported_completion: apiFunnelDelaySchema,
  reported_completion_to_full_payment: apiFunnelDelaySchema,
});

export const apiFunnelCohortSchema = z.object({
  category_source: z.string(),
  stages: z.array(apiFunnelStageSchema),
  global_completion_conversion_percentage: numericOrNull,
  delays: apiFunnelDelaysSchema,
});

export const apiAdminFunnelMetricsResponseSchema = z.object({
  period: apiFunnelPeriodSchema,
  timezone: z.string().optional(),
  observed_at: z.string().optional(),
  category_id: z.number().int().positive().nullable().optional(),
  rounding: z.string().optional(),
  decimal_places: z.number().int().optional(),
  cohorts: z.object({
    ai: apiFunnelCohortSchema,
    manual: apiFunnelCohortSchema.optional(),
  }),
});

export const apiFunnelStepMetricSchema = z.object({
  step_name: z.string(),
  count: z.number().int().nonnegative(),
  relative_conversion: z.number().min(0).max(1),
  avg_duration_minutes: z.number().nullable().optional(),
});

export const apiConversionFunnelLegacyResponseSchema = z.object({
  time_range: z.object({
    from: z.string(),
    to: z.string(),
  }),
  global_conversion_rate: z.number().min(0).max(1),
  steps: z.array(apiFunnelStepMetricSchema),
});

export const apiConversionFunnelResponseSchema = z.union([
  apiAdminFunnelMetricsResponseSchema,
  apiConversionFunnelLegacyResponseSchema,
]);

export type ApiFunnelPeriod = z.infer<typeof apiFunnelPeriodSchema>;
export type ApiFunnelStage = z.infer<typeof apiFunnelStageSchema>;
export type ApiFunnelDelay = z.infer<typeof apiFunnelDelaySchema>;
export type ApiFunnelDelays = z.infer<typeof apiFunnelDelaysSchema>;
export type ApiFunnelCohort = z.infer<typeof apiFunnelCohortSchema>;
export type ApiAdminFunnelMetricsResponse = z.infer<typeof apiAdminFunnelMetricsResponseSchema>;
export type ApiFunnelStepMetric = z.infer<typeof apiFunnelStepMetricSchema>;
export type ApiConversionFunnelLegacyResponse = z.infer<typeof apiConversionFunnelLegacyResponseSchema>;
export type ApiConversionFunnelResponse = z.infer<typeof apiConversionFunnelResponseSchema>;

