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

