import type { ApiAdminFunnelMetricsResponse } from "../../infrastructure/api/metrics-types";

const funnelDelays = {
  request_to_first_proposal: { observations: 0, mean_seconds: null },
  proposal_to_confirmed_hiring: { observations: 0, mean_seconds: null },
  confirmed_hiring_to_reported_completion: { observations: 0, mean_seconds: null },
  reported_completion_to_full_payment: { observations: 0, mean_seconds: null },
};

export const crmAiFunnelFixture: ApiAdminFunnelMetricsResponse = {
  period: {
    from: "2026-10-15T03:00:00Z",
    to: "2026-10-23T03:00:00Z",
  },
  timezone: "America/Argentina/Buenos_Aires",
  observed_at: "2026-10-23T12:00:00Z",
  category_id: null,
  rounding: "half_up",
  decimal_places: 2,
  cohorts: {
    ai: {
      category_source: "assessment.problem_category_id",
      stages: [
        { stage: "professional_assessment", count: 100, conversion_percentage: null },
        { stage: "request", count: 60, conversion_percentage: 60 },
        { stage: "proposal", count: 30, conversion_percentage: 30 },
        { stage: "confirmed_hiring", count: 0, conversion_percentage: null },
        { stage: "reported_completion", count: 0, conversion_percentage: null },
        { stage: "full_payment", count: 0, conversion_percentage: null },
        { stage: "review", count: 0, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: null,
      delays: funnelDelays,
    },
  },
};

export const crmAiAndManualFunnelFixture: ApiAdminFunnelMetricsResponse = {
  ...crmAiFunnelFixture,
  cohorts: {
    ...crmAiFunnelFixture.cohorts,
    manual: {
      category_source: "provider.current_category_id",
      stages: [
        { stage: "request", count: 3, conversion_percentage: null },
        { stage: "proposal", count: 2, conversion_percentage: 66.67 },
        { stage: "confirmed_hiring", count: 1, conversion_percentage: 50 },
        { stage: "reported_completion", count: 1, conversion_percentage: 100 },
        { stage: "full_payment", count: 0, conversion_percentage: 0 },
        { stage: "review", count: 0, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 33.33,
      delays: {
        request_to_first_proposal: { observations: 2, mean_seconds: 120 },
        proposal_to_confirmed_hiring: { observations: 1, mean_seconds: 60 },
        confirmed_hiring_to_reported_completion: { observations: 1, mean_seconds: 300 },
        reported_completion_to_full_payment: { observations: 0, mean_seconds: null },
      },
    },
  },
};

export const crmComparisonFunnelFixture: ApiAdminFunnelMetricsResponse = {
  ...crmAiAndManualFunnelFixture,
  cohorts: {
    ai: {
      category_source: "assessment.problem_category_id",
      stages: [
        { stage: "professional_assessment", count: 1, conversion_percentage: null },
        { stage: "request", count: 2, conversion_percentage: 200 },
        { stage: "proposal", count: 1, conversion_percentage: 50 },
        { stage: "confirmed_hiring", count: 1, conversion_percentage: 100 },
        { stage: "reported_completion", count: 1, conversion_percentage: 100 },
        { stage: "full_payment", count: 0, conversion_percentage: 0 },
        { stage: "review", count: 0, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 100,
      delays: funnelDelays,
    },
    manual: crmAiAndManualFunnelFixture.cohorts.manual!,
  },
  request_comparison: {
    ai: {
      category_source: "provider.current_category_id",
      stages: [
        { stage: "request", count: 2, conversion_percentage: null },
        { stage: "proposal", count: 1, conversion_percentage: 50 },
        { stage: "confirmed_hiring", count: 1, conversion_percentage: 100 },
        { stage: "reported_completion", count: 1, conversion_percentage: 100 },
        { stage: "full_payment", count: 0, conversion_percentage: 0 },
        { stage: "review", count: 0, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 50,
      delays: {
        request_to_first_proposal: { observations: 1, mean_seconds: 180 },
        proposal_to_confirmed_hiring: { observations: 1, mean_seconds: 90 },
        confirmed_hiring_to_reported_completion: { observations: 1, mean_seconds: 400 },
        reported_completion_to_full_payment: { observations: 0, mean_seconds: null },
      },
    },
    manual: {
      category_source: "provider.current_category_id",
      stages: [
        { stage: "request", count: 3, conversion_percentage: null },
        { stage: "proposal", count: 2, conversion_percentage: 66.67 },
        { stage: "confirmed_hiring", count: 1, conversion_percentage: 50 },
        { stage: "reported_completion", count: 1, conversion_percentage: 100 },
        { stage: "full_payment", count: 0, conversion_percentage: 0 },
        { stage: "review", count: 0, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 33.33,
      delays: {
        request_to_first_proposal: { observations: 2, mean_seconds: 120 },
        proposal_to_confirmed_hiring: { observations: 1, mean_seconds: 60 },
        confirmed_hiring_to_reported_completion: { observations: 1, mean_seconds: 300 },
        reported_completion_to_full_payment: { observations: 0, mean_seconds: null },
      },
    },
  },
};

export const crmZeroBaseAndZeroProgressFixture: ApiAdminFunnelMetricsResponse = {
  period: {
    from: "2026-10-15T03:00:00Z",
    to: "2026-10-23T03:00:00Z",
  },
  timezone: "America/Argentina/Buenos_Aires",
  observed_at: "2026-10-23T12:00:00Z",
  category_id: null,
  rounding: "half_up",
  decimal_places: 2,
  cohorts: {
    ai: {
      category_source: "assessment.problem_category_id",
      stages: [
        { stage: "professional_assessment", count: 100, conversion_percentage: null },
        { stage: "request", count: 0, conversion_percentage: 0 },
        { stage: "proposal", count: 0, conversion_percentage: 0 },
        { stage: "confirmed_hiring", count: 0, conversion_percentage: 0 },
        { stage: "reported_completion", count: 0, conversion_percentage: 0 },
        { stage: "full_payment", count: 0, conversion_percentage: 0 },
        { stage: "review", count: 0, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 0,
      delays: funnelDelays,
    },
    manual: {
      category_source: "provider.current_category_id",
      stages: [
        { stage: "request", count: 0, conversion_percentage: null },
        { stage: "proposal", count: 0, conversion_percentage: null },
        { stage: "confirmed_hiring", count: 0, conversion_percentage: null },
        { stage: "reported_completion", count: 0, conversion_percentage: null },
        { stage: "full_payment", count: 0, conversion_percentage: null },
        { stage: "review", count: 0, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: null,
      delays: funnelDelays,
    },
  },
};

export const crmDelaysAndObservationFixture: ApiAdminFunnelMetricsResponse = {
  period: {
    from: "2026-10-15T03:00:00Z",
    to: "2026-10-23T03:00:00Z",
  },
  timezone: "America/Argentina/Buenos_Aires",
  observed_at: "2026-10-23T12:00:00Z",
  category_id: null,
  rounding: "half_up",
  decimal_places: 2,
  cohorts: {
    ai: {
      category_source: "assessment.problem_category_id",
      stages: [
        { stage: "professional_assessment", count: 100, conversion_percentage: null },
        { stage: "request", count: 60, conversion_percentage: 60 },
        { stage: "proposal", count: 30, conversion_percentage: 30 },
        { stage: "confirmed_hiring", count: 15, conversion_percentage: 15 },
        { stage: "reported_completion", count: 10, conversion_percentage: 10 },
        { stage: "full_payment", count: 5, conversion_percentage: 5 },
        { stage: "review", count: 2, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 10,
      delays: {
        request_to_first_proposal: { observations: 25, mean_seconds: 900 },
        proposal_to_confirmed_hiring: { observations: 12, mean_seconds: 3600 },
        confirmed_hiring_to_reported_completion: { observations: 8, mean_seconds: 86400 },
        reported_completion_to_full_payment: { observations: 4, mean_seconds: 0 },
      },
    },
  },
};

export const crmComparisonFiltersFixture: ApiAdminFunnelMetricsResponse = {
  period: {
    from: "2026-09-24T03:00:00Z",
    to: "2026-10-24T03:00:00Z",
  },
  timezone: "America/Argentina/Buenos_Aires",
  observed_at: "2026-10-24T12:00:00Z",
  category_id: 47,
  rounding: "half_up",
  decimal_places: 2,
  cohorts: {
    ai: {
      category_source: "assessment.problem_category_id",
      stages: [
        { stage: "professional_assessment", count: 10, conversion_percentage: null },
        { stage: "request", count: 8, conversion_percentage: 80 },
        { stage: "proposal", count: 5, conversion_percentage: 50 },
        { stage: "confirmed_hiring", count: 4, conversion_percentage: 40 },
        { stage: "reported_completion", count: 4, conversion_percentage: 40 },
        { stage: "full_payment", count: 2, conversion_percentage: 20 },
        { stage: "review", count: 1, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 40,
      delays: funnelDelays,
    },
    manual: {
      category_source: "provider.current_category_id",
      stages: [
        { stage: "request", count: 12, conversion_percentage: null },
        { stage: "proposal", count: 8, conversion_percentage: 66.67 },
        { stage: "confirmed_hiring", count: 6, conversion_percentage: 50 },
        { stage: "reported_completion", count: 6, conversion_percentage: 50 },
        { stage: "full_payment", count: 3, conversion_percentage: 25 },
        { stage: "review", count: 2, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 50,
      delays: funnelDelays,
    },
  },
  request_comparison: {
    ai: {
      category_source: "provider.current_category_id",
      stages: [
        { stage: "request", count: 8, conversion_percentage: null },
        { stage: "proposal", count: 5, conversion_percentage: 62.5 },
        { stage: "confirmed_hiring", count: 4, conversion_percentage: 50 },
        { stage: "reported_completion", count: 4, conversion_percentage: 50 },
        { stage: "full_payment", count: 2, conversion_percentage: 25 },
        { stage: "review", count: 1, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 50,
      delays: funnelDelays,
    },
    manual: {
      category_source: "provider.current_category_id",
      stages: [
        { stage: "request", count: 12, conversion_percentage: null },
        { stage: "proposal", count: 8, conversion_percentage: 66.67 },
        { stage: "confirmed_hiring", count: 6, conversion_percentage: 50 },
        { stage: "reported_completion", count: 6, conversion_percentage: 50 },
        { stage: "full_payment", count: 3, conversion_percentage: 25 },
        { stage: "review", count: 2, conversion_percentage: null },
      ],
      global_completion_conversion_percentage: 50,
      delays: funnelDelays,
    },
  },
};

type FunnelStage = ApiAdminFunnelMetricsResponse["cohorts"]["ai"]["stages"][number]["stage"];
type FunnelStageCounts = Partial<Record<FunnelStage, number>>;

function withStageCounts(
  cohort: ApiAdminFunnelMetricsResponse["cohorts"]["ai"],
  counts: FunnelStageCounts,
) {
  const conversionPercentage = (numerator: number, denominator: number) =>
    denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(2)) : null;
  const stages = cohort.stages.map((stage) => ({
    ...stage,
    count: counts[stage.stage] ?? stage.count,
  }));
  const initialCount = stages[0]?.count ?? 0;
  const completionCount =
    stages.find((stage) => stage.stage === "reported_completion")?.count ?? 0;

  return {
    ...cohort,
    stages: stages.map((stage, index) => ({
      ...stage,
      conversion_percentage: index === 0
        ? null
        : conversionPercentage(stage.count, initialCount),
    })),
    global_completion_conversion_percentage: conversionPercentage(
      completionCount,
      initialCount,
    ),
  };
}

function withComparisonStageCounts(
  fixture: ApiAdminFunnelMetricsResponse,
  aiCounts: FunnelStageCounts,
  manualCounts: FunnelStageCounts,
): ApiAdminFunnelMetricsResponse {
  const requestComparison = fixture.request_comparison;
  if (!requestComparison) {
    throw new Error("CRM comparison fixture requires request comparison data");
  }

  return {
    ...fixture,
    category_id: null,
    cohorts: {
      ...fixture.cohorts,
      ai: withStageCounts(fixture.cohorts.ai, aiCounts),
      ...(fixture.cohorts.manual
        ? { manual: withStageCounts(fixture.cohorts.manual, manualCounts) }
        : {}),
    },
    request_comparison: {
      ...requestComparison,
      ai: withStageCounts(requestComparison.ai, aiCounts),
      manual: withStageCounts(requestComparison.manual, manualCounts),
    },
  };
}

export const crmComparisonPeriodFiltersFixture = withComparisonStageCounts(
  crmComparisonFiltersFixture,
  {
    professional_assessment: 10,
    request: 10,
    proposal: 6,
    confirmed_hiring: 5,
    reported_completion: 5,
    full_payment: 3,
    review: 2,
  },
  {
    request: 15,
    proposal: 10,
    confirmed_hiring: 7,
    reported_completion: 7,
    full_payment: 4,
    review: 3,
  },
);

