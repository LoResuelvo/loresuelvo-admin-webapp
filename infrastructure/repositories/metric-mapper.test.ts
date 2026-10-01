import { describe, expect, it } from "vitest";
import { mapConversionFunnel, mapFunnelStep, resolveStepLabel } from "./metric-mapper";

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
    expect(result.globalConversionRate).toBe(0.32);
    expect(result.steps).toHaveLength(6);

    const firstStep = result.steps[0];
    expect(firstStep).toEqual({
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 250,
      relativeConversion: 1.0,
      avgDurationMinutes: null,
    });

    const secondStep = result.steps[1];
    expect(secondStep).toEqual({
      stepName: "requests_created",
      label: "Solicitudes publicadas",
      count: 180,
      relativeConversion: 0.72,
      avgDurationMinutes: 15,
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
    const step = mapFunnelStep({
      step_name: "proposals_sent",
      count: 50,
      relative_conversion: 0.5,
      avg_duration_minutes: 120,
    });

    expect(step.stepName).toBe("proposals_sent");
    expect(step.label).toBe("Propuestas comerciales");
    expect(step.count).toBe(50);
    expect(step.relativeConversion).toBe(0.5);
    expect(step.avgDurationMinutes).toBe(120);
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
    expect(result.globalConversionRate).toBe(0.6667);
    expect(result.steps).toHaveLength(6);

    expect(result.steps[0]).toEqual({
      stepName: "ai_diagnostics",
      label: "Diagnósticos IA",
      count: 3,
      relativeConversion: 1.0,
      avgDurationMinutes: null,
    });

    expect(result.steps[1]).toEqual({
      stepName: "requests_created",
      label: "Solicitudes publicadas",
      count: 2,
      relativeConversion: 0.6667,
      avgDurationMinutes: null,
    });

    expect(result.steps[2]).toEqual({
      stepName: "proposals_sent",
      label: "Propuestas comerciales",
      count: 2,
      relativeConversion: 1.0,
      avgDurationMinutes: 1, // 33.34s / 60 rounded
    });

    expect(result.steps[3]).toEqual({
      stepName: "deposits_paid",
      label: "Señas pagadas",
      count: 2,
      relativeConversion: 1.0,
      avgDurationMinutes: 0, // 14.17s / 60 rounded
    });

    expect(result.steps[4]).toEqual({
      stepName: "orders_completed",
      label: "Órdenes concluidas",
      count: 2,
      relativeConversion: 1.0,
      avgDurationMinutes: 2880, // 172820.00s / 60 rounded
    });

    expect(result.steps[5]).toEqual({
      stepName: "reviews_submitted",
      label: "Reseñas enviadas",
      count: 1,
      relativeConversion: 1.0,
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
    expect(result.globalConversionRate).toBe(0);
    expect(result.steps).toHaveLength(6);
    expect(result.steps.every((s) => s.count === 0)).toBe(true);
    expect(result.steps.every((s) => s.relativeConversion === 0)).toBe(true);
    expect(result.steps.every((s) => s.avgDurationMinutes === null)).toBe(true);
  });

  it("throws validation error on invalid payload", () => {
    expect(() => mapConversionFunnel({})).toThrow();
    expect(() => mapConversionFunnel({ global_conversion_rate: 2.0 })).toThrow();
  });
});

