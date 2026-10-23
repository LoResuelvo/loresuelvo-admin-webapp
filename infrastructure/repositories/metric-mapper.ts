import {
  calculateConversionRate,
  type ConversionFunnel,
  type FunnelCohort,
  type FunnelDelayMetric,
  type FunnelSource,
  type FunnelStepMetric,
  type FunnelStepName,
} from "@/domain/metrics/funnel";
import {
  apiAdminFunnelMetricsResponseSchema,
  apiConversionFunnelLegacyResponseSchema,
  type ApiAdminFunnelMetricsResponse,
  type ApiConversionFunnelLegacyResponse,
  type ApiFunnelCohort,
  type ApiFunnelDelay,
  type ApiFunnelStepMetric,
} from "@/infrastructure/api/types";
import { translations } from "@/infrastructure/i18n/translations";

const stepLabels: Record<string, string> = translations.metrics.steps;

export function resolveStepLabel(stepName: string): string {
  return stepLabels[stepName] ?? stepName;
}

type MappedLegacyStep = Readonly<{
  stepName: FunnelStepName;
  label: string;
  count: number;
  avgDurationMinutes: number | null;
}>;

function mapFunnelStep(dto: ApiFunnelStepMetric): MappedLegacyStep {
  return {
    stepName: dto.step_name as FunnelStepName,
    label: resolveStepLabel(dto.step_name),
    count: dto.count,
    avgDurationMinutes: dto.avg_duration_minutes ?? null,
  };
}

type StepConfig = Readonly<{
  stageKey: string;
  stepName: FunnelStepName;
  delayKey?: keyof ApiFunnelCohort["delays"];
}>;

const AI_STEPS: readonly StepConfig[] = [
  { stageKey: "professional_assessment", stepName: "ai_diagnostics" },
  { stageKey: "request", stepName: "requests_created" },
  {
    stageKey: "proposal",
    stepName: "proposals_sent",
    delayKey: "request_to_first_proposal",
  },
  {
    stageKey: "confirmed_hiring",
    stepName: "deposits_paid",
    delayKey: "proposal_to_confirmed_hiring",
  },
  {
    stageKey: "reported_completion",
    stepName: "orders_completed",
    delayKey: "confirmed_hiring_to_reported_completion",
  },
  {
    stageKey: "full_payment",
    stepName: "full_payments",
    delayKey: "reported_completion_to_full_payment",
  },
  { stageKey: "review", stepName: "reviews_submitted" },
];

const MANUAL_STEPS: readonly StepConfig[] = AI_STEPS.slice(1);

const INITIAL_STAGE: Readonly<Record<FunnelSource, string>> = {
  ai: "professional_assessment",
  manual: "request",
};

function percentageToRate(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number((value / 100).toFixed(4));
}

function secondsToMinutes(meanSeconds: number | null | undefined): number | null {
  if (meanSeconds === null || meanSeconds === undefined) return null;
  return Math.round(meanSeconds / 60);
}

function mapDelay(delay: ApiFunnelDelay): FunnelDelayMetric {
  return {
    observations: delay.observations,
    meanSeconds: delay.mean_seconds ?? null,
  };
}

function mapDelays(cohort: ApiFunnelCohort): FunnelCohort["delays"] {
  return {
    requestToFirstProposal: mapDelay(cohort.delays.request_to_first_proposal),
    proposalToConfirmedHiring: mapDelay(cohort.delays.proposal_to_confirmed_hiring),
    confirmedHiringToReportedCompletion: mapDelay(
      cohort.delays.confirmed_hiring_to_reported_completion,
    ),
    reportedCompletionToFullPayment: mapDelay(
      cohort.delays.reported_completion_to_full_payment,
    ),
  };
}

function mapModernSteps(
  cohort: ApiFunnelCohort,
  source: FunnelSource,
): FunnelStepMetric[] {
  const stepsConfig = source === "ai" ? AI_STEPS : MANUAL_STEPS;
  const stageMap = new Map(cohort.stages.map((stage) => [stage.stage, stage]));
  const initialCount = stageMap.get(INITIAL_STAGE[source])?.count ?? 0;

  return stepsConfig.map((config, index) => {
    const stage = stageMap.get(config.stageKey);
    const count = stage?.count ?? 0;
    const previousConfig = stepsConfig[index - 1];
    const previousCount = previousConfig
      ? stageMap.get(previousConfig.stageKey)?.count ?? 0
      : null;
    const delay = config.delayKey ? cohort.delays[config.delayKey] : null;

    return {
      stepName: config.stepName,
      label: resolveStepLabel(config.stepName),
      count,
      conversionFromStart: calculateConversionRate(count, initialCount),
      conversionFromPrevious:
        previousCount === null
          ? null
          : {
              rate: calculateConversionRate(count, previousCount),
              numerator: count,
              denominator: previousCount,
            },
      avgDurationMinutes: secondsToMinutes(delay?.mean_seconds),
    };
  });
}

function mapModernCohort(
  dto: ApiFunnelCohort,
  source: FunnelSource,
): FunnelCohort {
  const stages = new Map(dto.stages.map((stage) => [stage.stage, stage]));
  const globalConversionNumerator = stages.get("reported_completion")?.count ?? 0;
  const globalConversionDenominator = stages.get(INITIAL_STAGE[source])?.count ?? 0;

  return {
    source,
    initialUnit: source === "ai" ? "professional_assessment" : "request",
    categorySource: dto.category_source,
    globalConversionRate: percentageToRate(
      dto.global_completion_conversion_percentage,
    ),
    globalConversionNumerator,
    globalConversionDenominator,
    delays: mapDelays(dto),
    steps: mapModernSteps(dto, source),
  };
}

function mapMetadata(dto: ApiAdminFunnelMetricsResponse): ConversionFunnel["metadata"] {
  return {
    ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
    ...(dto.observed_at !== undefined ? { observedAt: dto.observed_at } : {}),
    ...(dto.category_id !== undefined ? { categoryId: dto.category_id } : {}),
    ...(dto.rounding !== undefined ? { rounding: dto.rounding } : {}),
    ...(dto.decimal_places !== undefined ? { decimalPlaces: dto.decimal_places } : {}),
  };
}

function mapOpenApiFunnel(dto: ApiAdminFunnelMetricsResponse): ConversionFunnel {
  return {
    from: dto.period.from,
    to: dto.period.to,
    metadata: mapMetadata(dto),
    cohorts: {
      ai: mapModernCohort(dto.cohorts.ai, "ai"),
      ...(dto.cohorts.manual
        ? { manual: mapModernCohort(dto.cohorts.manual, "manual") }
        : {}),
    },
  };
}

function mapLegacyFunnel(dto: ApiConversionFunnelLegacyResponse): ConversionFunnel {
  const mappedSteps = dto.steps.map(mapFunnelStep);
  const initialCount = mappedSteps[0]?.count ?? 0;
  const steps: FunnelStepMetric[] = mappedSteps.map((step, index) => {
    const previousCount = mappedSteps[index - 1]?.count;
    return {
      stepName: step.stepName,
      label: step.label,
      count: step.count,
      conversionFromStart: calculateConversionRate(step.count, initialCount),
      conversionFromPrevious:
        previousCount === undefined
          ? null
          : {
              rate: calculateConversionRate(step.count, previousCount),
              numerator: step.count,
              denominator: previousCount,
            },
      avgDurationMinutes: step.avgDurationMinutes,
    };
  });
  const globalConversionNumerator =
    steps.find((step) => step.stepName === "orders_completed")?.count ?? 0;

  return {
    from: dto.time_range.from,
    to: dto.time_range.to,
    cohorts: {
      ai: {
        source: "ai",
        initialUnit: "professional_assessment",
        categorySource: null,
        globalConversionRate: dto.global_conversion_rate,
        globalConversionNumerator,
        globalConversionDenominator: initialCount,
        delays: {},
        steps,
      },
    },
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
