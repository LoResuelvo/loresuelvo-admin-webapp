import { z } from "zod";

export const apiFunnelStepMetricSchema = z.object({
  step_name: z.string(),
  count: z.number().int().nonnegative(),
  relative_conversion: z.number().min(0).max(1),
  avg_duration_minutes: z.number().nullable().optional(),
});

export const apiConversionFunnelResponseSchema = z.object({
  time_range: z.object({
    from: z.string(),
    to: z.string(),
  }),
  global_conversion_rate: z.number().min(0).max(1),
  steps: z.array(apiFunnelStepMetricSchema),
});

export type ApiFunnelStepMetric = z.infer<typeof apiFunnelStepMetricSchema>;
export type ApiConversionFunnelResponse = z.infer<typeof apiConversionFunnelResponseSchema>;
