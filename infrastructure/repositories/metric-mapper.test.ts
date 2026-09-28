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

  it("throws validation error on invalid payload", () => {
    expect(() => mapConversionFunnel({})).toThrow();
    expect(() => mapConversionFunnel({ global_conversion_rate: 2.0 })).toThrow();
  });
});
