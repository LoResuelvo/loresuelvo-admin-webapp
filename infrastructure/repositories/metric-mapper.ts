import type {
  ConversionFunnel,
  FunnelStepMetric,
  FunnelStepName,
} from "@/domain/metrics/funnel";
import {
  apiConversionFunnelResponseSchema,
  type ApiConversionFunnelResponse,
  type ApiFunnelStepMetric,
} from "@/infrastructure/api/types";
import { translations } from "@/infrastructure/i18n/translations";

const stepLabels: Record<string, string> = translations.metrics.steps;

export function resolveStepLabel(stepName: string): string {
  return stepLabels[stepName] ?? stepName;
}

export function mapFunnelStep(dto: ApiFunnelStepMetric): FunnelStepMetric {
  return {
    stepName: dto.step_name as FunnelStepName,
    label: resolveStepLabel(dto.step_name),
    count: dto.count,
    relativeConversion: dto.relative_conversion,
    avgDurationMinutes: dto.avg_duration_minutes ?? null,
  };
}

export function mapConversionFunnel(raw: unknown): ConversionFunnel {
  const parsed: ApiConversionFunnelResponse =
    apiConversionFunnelResponseSchema.parse(raw);
  return {
    from: parsed.time_range.from,
    to: parsed.time_range.to,
    globalConversionRate: parsed.global_conversion_rate,
    steps: parsed.steps.map(mapFunnelStep),
  };
}
