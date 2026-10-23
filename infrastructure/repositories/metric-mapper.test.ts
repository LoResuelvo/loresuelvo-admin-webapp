import { describe, expect, it } from "vitest";
import { mapConversionFunnel, resolveStepLabel } from "./metric-mapper";

const mockApiPayload = {
  time_range: {
    from: "2026-08-25",
    to: "2026-09-24",
  },
  global_conversion_rate: 0.32,
  steps: [
    {
      step_name: "ai_diagnostics",
      count: 250,
      relative_conversion: 1.0,
      avg_duration_minutes: null,
    },
    {
      step_name: "requests_created",
      count: 180,
      relative_conversion: 0.72,
      avg_duration_minutes: 15,
    },
    {
      step_name: "proposals_sent",
      count: 140,
      relative_conversion: 0.77,
      avg_duration_minutes: 240,
    },
    {
      step_name: "deposits_paid",
      count: 105,
      relative_conversion: 0.75,
      avg_duration_minutes: 360,
    },
    {
      step_name: "orders_completed",
      count: 88,
      relative_conversion: 0.83,
      avg_duration_minutes: 2880,
    },
    {
      step_name: "reviews_submitted",
      count: 80,
      relative_conversion: 0.9,
      avg_duration_minutes: 1440,
    },
  ],
};

describe("metric-mapper", () => {
  it("maps API conversion funnel payload to domain model", () => {
    const result = mapConversionFunnel(mockApiPayload);

    expect(result.from).toBe("2026-08-25");
    expect(result.to).toBe("2026-09-24");
    expect(result.cohorts.ai?.globalConversionRate).toBe(0.32);
    expect(result.cohorts.ai?.globalConversionNumerator).toBe(88);
    expect(result.cohorts.ai?.globalConversionDenominator).toBe(250);
    expect(result.cohorts.ai?.steps).toHaveLength(6);

    const firstStep = result.cohorts.ai?.steps[0];
    expect(firstStep).toEqual({
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 250,
      conversionFromStart: 1,
      conversionFromPrevious: null,
      avgDurationMinutes: null,
    });

    const secondStep = result.cohorts.ai?.steps[1];
    expect(secondStep).toEqual({
      stepName: "requests_created",
      label: "Solicitudes publicadas",
      count: 180,
      conversionFromStart: 0.72,
      conversionFromPrevious: { rate: 0.72, numerator: 180, denominator: 250 },
      avgDurationMinutes: 15,
    });

    expect(result.cohorts.ai?.steps[2]?.conversionFromPrevious).toEqual({
      rate: 0.7778,
      numerator: 140,
      denominator: 180,
    });
  });

  it("resolves friendly labels for all known steps", () => {
    expect(resolveStepLabel("ai_diagnostics")).toBe("Diagnósticos IA");
    expect(resolveStepLabel("requests_created")).toBe("Solicitudes publicadas");
    expect(resolveStepLabel("proposals_sent")).toBe("Propuestas comerciales");
    expect(resolveStepLabel("deposits_paid")).toBe("Señas pagadas");
    expect(resolveStepLabel("orders_completed")).toBe("Órdenes concluidas");
    expect(resolveStepLabel("reviews_submitted")).toBe("Reseñas enviadas");
    expect(resolveStepLabel("unknown_step")).toBe("unknown_step");
  });

  it("handles single step mapping", () => {
    const result = mapConversionFunnel({
      time_range: { from: "2026-08-25", to: "2026-09-24" },
      global_conversion_rate: 1,
      steps: [
        {
          step_name: "proposals_sent",
          count: 50,
          relative_conversion: 1,
          avg_duration_minutes: 120,
        },
      ],
    });
    const step = result.cohorts.ai?.steps[0];

    expect(step).toEqual({
      stepName: "proposals_sent",
      label: "Propuestas comerciales",
      count: 50,
      conversionFromStart: 1,
      conversionFromPrevious: null,
      avgDurationMinutes: 120,
    });
  });

  it("maps official OpenAPI AdminFunnelMetrics payload to domain model", () => {
    const mockOpenApiPopulatedPayload = {
      period: {
        from: "2026-09-10T00:00:00Z",
        to: "2026-09-11T00:00:00Z",
      },
      timezone: "America/Argentina/Buenos_Aires",
      observed_at: "2026-09-30T15:00:00Z",
      category_id: null,
      rounding: "half_up",
      decimal_places: 2,
      cohorts: {
        ai: {
          category_source: "assessment.problem_category_id",
          stages: [
            { stage: "professional_assessment", count: 3, conversion_percentage: null },
            { stage: "request", count: 2, conversion_percentage: 66.67 },
            { stage: "proposal", count: 2, conversion_percentage: 100.0 },
            { stage: "confirmed_hiring", count: 2, conversion_percentage: 100.0 },
            { stage: "reported_completion", count: 2, conversion_percentage: 100.0 },
            { stage: "full_payment", count: 1, conversion_percentage: 50.0 },
            { stage: "review", count: 1, conversion_percentage: 100.0 },
          ],
          global_completion_conversion_percentage: 66.67,
          delays: {
            request_to_first_proposal: { observations: 2, mean_seconds: 33.34 },
            proposal_to_confirmed_hiring: { observations: 3, mean_seconds: 14.17 },
            confirmed_hiring_to_reported_completion: { observations: 2, mean_seconds: 172820.0 },
            reported_completion_to_full_payment: { observations: 1, mean_seconds: 40.0 },
          },
        },
      },
    };

    const result = mapConversionFunnel(mockOpenApiPopulatedPayload);

    expect(result.from).toBe("2026-09-10T00:00:00Z");
    expect(result.to).toBe("2026-09-11T00:00:00Z");
    expect(result.cohorts.ai?.globalConversionRate).toBe(0.6667);
    expect(result.cohorts.ai?.steps).toHaveLength(7);

    expect(result.cohorts.ai?.steps[0]).toEqual({
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 3,
      conversionFromStart: 1,
      conversionFromPrevious: null,
      avgDurationMinutes: null,
    });

    expect(result.cohorts.ai?.steps[1]).toEqual({
      stepName: "requests_created",
      label: "Solicitudes publicadas",
      count: 2,
      conversionFromStart: 0.6667,
      conversionFromPrevious: { rate: 0.6667, numerator: 2, denominator: 3 },
      avgDurationMinutes: null,
    });

    expect(result.cohorts.ai?.steps[2]).toEqual({
      stepName: "proposals_sent",
      label: "Propuestas comerciales",
      count: 2,
      conversionFromStart: 0.6667,
      conversionFromPrevious: { rate: 1, numerator: 2, denominator: 2 },
      avgDurationMinutes: 1, // 33.34s / 60 rounded
    });

    expect(result.cohorts.ai?.steps[3]).toEqual({
      stepName: "deposits_paid",
      label: "Señas pagadas",
      count: 2,
      conversionFromStart: 0.6667,
      conversionFromPrevious: { rate: 1, numerator: 2, denominator: 2 },
      avgDurationMinutes: 0, // 14.17s / 60 rounded
    });

    expect(result.cohorts.ai?.steps[4]).toEqual({
      stepName: "orders_completed",
      label: "Órdenes concluidas",
      count: 2,
      conversionFromStart: 0.6667,
      conversionFromPrevious: { rate: 1, numerator: 2, denominator: 2 },
      avgDurationMinutes: 2880, // 172820.00s / 60 rounded
    });

    expect(result.cohorts.ai?.steps[5]).toEqual({
      stepName: "full_payments",
      label: "Pagos completos",
      count: 1,
      conversionFromStart: 0.3333,
      conversionFromPrevious: { rate: 0.5, numerator: 1, denominator: 2 },
      avgDurationMinutes: 1,
    });

    expect(result.cohorts.ai?.steps[6]).toEqual({
      stepName: "reviews_submitted",
      label: "Reseñas enviadas",
      count: 1,
      conversionFromStart: 0.3333,
      conversionFromPrevious: { rate: 1, numerator: 1, denominator: 1 },
      avgDurationMinutes: null,
    });
  });

  it("maps empty OpenAPI AdminFunnelMetrics payload without errors", () => {
    const mockOpenApiEmptyPayload = {
      period: {
        from: "2026-08-31T15:00:00Z",
        to: "2026-09-30T15:00:00Z",
      },
      timezone: "America/Argentina/Buenos_Aires",
      observed_at: "2026-09-30T15:00:00Z",
      category_id: 2147483000,
      rounding: "half_up",
      decimal_places: 2,
      cohorts: {
        ai: {
          category_source: "assessment.problem_category_id",
          stages: [
            { stage: "professional_assessment", count: 0, conversion_percentage: null },
            { stage: "request", count: 0, conversion_percentage: null },
            { stage: "proposal", count: 0, conversion_percentage: null },
            { stage: "confirmed_hiring", count: 0, conversion_percentage: null },
            { stage: "reported_completion", count: 0, conversion_percentage: null },
            { stage: "full_payment", count: 0, conversion_percentage: null },
            { stage: "review", count: 0, conversion_percentage: null },
          ],
          global_completion_conversion_percentage: null,
          delays: {
            request_to_first_proposal: { observations: 0, mean_seconds: null },
            proposal_to_confirmed_hiring: { observations: 0, mean_seconds: null },
            confirmed_hiring_to_reported_completion: { observations: 0, mean_seconds: null },
            reported_completion_to_full_payment: { observations: 0, mean_seconds: null },
          },
        },
      },
    };

    const result = mapConversionFunnel(mockOpenApiEmptyPayload);

    expect(result.from).toBe("2026-08-31T15:00:00Z");
    expect(result.to).toBe("2026-09-30T15:00:00Z");
    expect(result.cohorts.ai?.globalConversionRate).toBeNull();
    expect(result.cohorts.ai?.steps).toHaveLength(7);
    expect(result.cohorts.ai?.steps.every((s) => s.count === 0)).toBe(true);
    expect(result.cohorts.ai?.steps.every((s) => s.conversionFromStart === null)).toBe(true);
    expect(result.cohorts.ai?.steps.every((s) => s.avgDurationMinutes === null)).toBe(true);
  });

  it("throws validation error on invalid payload", () => {
    expect(() => mapConversionFunnel({})).toThrow();
    expect(() => mapConversionFunnel({ global_conversion_rate: 2.0 })).toThrow();
  });

  it("maps AI and manual cohorts with their own initial stages and keeps source metadata", () => {
    const payload = {
      period: { from: "2026-10-15T03:00:00Z", to: "2026-10-23T03:00:00Z" },
      timezone: "America/Argentina/Buenos_Aires",
      observed_at: "2026-10-23T12:00:00Z",
      category_id: 47,
      rounding: "half_up",
      decimal_places: 2,
      cohorts: {
        ai: {
          category_source: "assessment.problem_category_id",
          stages: [
            { stage: "professional_assessment", count: 100, conversion_percentage: null },
            { stage: "request", count: 60, conversion_percentage: 60 },
            { stage: "proposal", count: 30, conversion_percentage: 30 },
            { stage: "reported_completion", count: 12, conversion_percentage: 12 },
          ],
          global_completion_conversion_percentage: 12,
          delays: {
            request_to_first_proposal: { observations: 30, mean_seconds: 180 },
            proposal_to_confirmed_hiring: { observations: 15, mean_seconds: null },
            confirmed_hiring_to_reported_completion: { observations: 12, mean_seconds: 600 },
            reported_completion_to_full_payment: { observations: 0, mean_seconds: null },
          },
        },
        manual: {
          category_source: "provider.current_category_id",
          stages: [
            { stage: "request", count: 3, conversion_percentage: null },
            { stage: "proposal", count: 2, conversion_percentage: 66.67 },
            { stage: "confirmed_hiring", count: 1, conversion_percentage: 33.33 },
            { stage: "reported_completion", count: 1, conversion_percentage: 33.33 },
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

    const result = mapConversionFunnel(payload);
    const ai = result.cohorts.ai;
    const manual = result.cohorts.manual;

    expect(result.metadata?.observedAt).toBe("2026-10-23T12:00:00Z");
    expect(ai?.steps[0]).toMatchObject({
      stepName: "ai_diagnostics",
      count: 100,
      conversionFromStart: 1,
      conversionFromPrevious: null,
    });
    expect(ai?.steps[1]).toMatchObject({
      stepName: "requests_created",
      conversionFromStart: 0.6,
      conversionFromPrevious: { rate: 0.6, numerator: 60, denominator: 100 },
    });
    expect(manual?.steps.map((step) => step.stepName)).toEqual([
      "requests_created",
      "proposals_sent",
      "deposits_paid",
      "orders_completed",
      "full_payments",
      "reviews_submitted",
    ]);
    expect(manual?.steps[0]).toMatchObject({
      count: 3,
      conversionFromStart: 1,
      conversionFromPrevious: null,
    });
    expect(manual?.steps[1]).toMatchObject({
      count: 2,
      conversionFromStart: 0.6667,
      conversionFromPrevious: { rate: 0.6667, numerator: 2, denominator: 3 },
    });
    expect(manual?.globalConversionRate).toBe(0.3333);
    expect(manual?.globalConversionNumerator).toBe(1);
    expect(manual?.globalConversionDenominator).toBe(3);
    expect(manual?.categorySource).toBe("provider.current_category_id");
    expect(manual?.delays.requestToFirstProposal).toEqual({
      observations: 2,
      meanSeconds: 120,
    });
  });

  it("preserves missing modern conversion values when the cohort has no initial cases", () => {
    const emptyPayload = {
      period: { from: "2026-10-15T03:00:00Z", to: "2026-10-23T03:00:00Z" },
      cohorts: {
        ai: {
          category_source: "assessment.problem_category_id",
          stages: [
            { stage: "professional_assessment", count: 0, conversion_percentage: null },
            { stage: "request", count: 0, conversion_percentage: null },
          ],
          global_completion_conversion_percentage: null,
          delays: {
            request_to_first_proposal: { observations: 0, mean_seconds: null },
            proposal_to_confirmed_hiring: { observations: 0, mean_seconds: null },
            confirmed_hiring_to_reported_completion: { observations: 0, mean_seconds: null },
            reported_completion_to_full_payment: { observations: 0, mean_seconds: null },
          },
        },
      },
    };

    const result = mapConversionFunnel(emptyPayload);

    expect(result.cohorts.ai?.globalConversionRate).toBeNull();
    expect(result.cohorts.ai?.steps[0]?.conversionFromStart).toBeNull();
    expect(result.cohorts.ai?.steps[1]?.conversionFromStart).toBeNull();
    expect(result.cohorts.ai?.steps[1]?.conversionFromPrevious).toEqual({
      rate: null,
      numerator: 0,
      denominator: 0,
    });
  });
});

