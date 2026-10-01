import type {
  ConversionFunnel,
  FunnelStepMetric,
  FunnelStepName,
} from "@/domain/metrics/funnel";
import {
  apiAdminFunnelMetricsResponseSchema,
  apiConversionFunnelLegacyResponseSchema,
  type ApiAdminFunnelMetricsResponse,
  type ApiConversionFunnelLegacyResponse,
  type ApiFunnelCohort,
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

function mapDelayToMinutes(meanSeconds?: number | null): number | null {
  if (meanSeconds === null || meanSeconds === undefined) return null;
  return Math.round(meanSeconds / 60);
}

type StepConfig = {
  stageKey: string;
  stepName: FunnelStepName;
  getDelay: (delays: ApiFunnelCohort["delays"]) => number | null;
  isFirst?: boolean;
};

const STEPS_CONFIG: StepConfig[] = [
  {
    stageKey: "professional_assessment",
    stepName: "ai_diagnostics",
    getDelay: () => null,
    isFirst: true,
  },
  {
    stageKey: "request",
    stepName: "requests_created",
    getDelay: () => null,
  },
  {
    stageKey: "proposal",
    stepName: "proposals_sent",
    getDelay: (d) => mapDelayToMinutes(d.request_to_first_proposal.mean_seconds),
  },
  {
    stageKey: "confirmed_hiring",
    stepName: "deposits_paid",
    getDelay: (d) => mapDelayToMinutes(d.proposal_to_confirmed_hiring.mean_seconds),
  },
  {
    stageKey: "reported_completion",
    stepName: "orders_completed",
    getDelay: (d) => mapDelayToMinutes(d.confirmed_hiring_to_reported_completion.mean_seconds),
  },
  {
    stageKey: "review",
    stepName: "reviews_submitted",
    getDelay: () => null,
  },
];

function mapOpenApiCohortToSteps(cohort: ApiFunnelCohort): FunnelStepMetric[] {
  const stageMap = new Map(cohort.stages.map((s) => [s.stage, s]));

  return STEPS_CONFIG.map(({ stageKey, stepName, getDelay, isFirst }) => {
    const stage = stageMap.get(stageKey);
    const count = stage?.count ?? 0;
    let relativeConversion = 0;
    if (isFirst) {
      relativeConversion = count > 0 ? 1.0 : 0;
    } else if (stage?.conversion_percentage !== null && stage?.conversion_percentage !== undefined) {
      relativeConversion = Number((stage.conversion_percentage / 100).toFixed(4));
    }

    return {
      stepName,
      label: resolveStepLabel(stepName),
      count,
      relativeConversion,
      avgDurationMinutes: getDelay(cohort.delays),
    };
  });
}


function mapOpenApiFunnel(dto: ApiAdminFunnelMetricsResponse): ConversionFunnel {
  const aiCohort = dto.cohorts.ai;
  const globalRate =
    aiCohort.global_completion_conversion_percentage !== null &&
    aiCohort.global_completion_conversion_percentage !== undefined
      ? Number((aiCohort.global_completion_conversion_percentage / 100).toFixed(4))
      : 0;

  return {
    from: dto.period.from,
    to: dto.period.to,
    globalConversionRate: globalRate,
    steps: mapOpenApiCohortToSteps(aiCohort),
  };
}

function mapLegacyFunnel(dto: ApiConversionFunnelLegacyResponse): ConversionFunnel {
  return {
    from: dto.time_range.from,
    to: dto.time_range.to,
    globalConversionRate: dto.global_conversion_rate,
    steps: dto.steps.map(mapFunnelStep),
  };
}

export function mapConversionFunnel(raw: unknown): ConversionFunnel {
  const openApiResult = apiAdminFunnelMetricsResponseSchema.safeParse(raw);
  if (openApiResult.success) {
    return mapOpenApiFunnel(openApiResult.data);
  }

  const legacyResult = apiConversionFunnelLegacyResponseSchema.safeParse(raw);
  if (legacyResult.success) {
    return mapLegacyFunnel(legacyResult.data);
  }

  apiAdminFunnelMetricsResponseSchema.parse(raw);
  throw new Error("Invalid conversion funnel response");
}

