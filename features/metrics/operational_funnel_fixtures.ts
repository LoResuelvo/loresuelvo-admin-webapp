import type { ApiAdminFunnelMetricsResponse } from "../../infrastructure/api/metrics-types";

const stageNames = ["professional_assessment", "request", "proposal", "confirmed_hiring", "reported_completion", "full_payment", "review"];

function funnelFixture(counts: number[], percentages: number[], globalPercentage: number, delayMinutes: number[]): ApiAdminFunnelMetricsResponse {
  const delay = (index: number) => ({ observations: counts[index + 2], mean_seconds: delayMinutes[index] * 60 });
  const cohort = {
    category_source: "assessment.problem_category_id",
    stages: stageNames.map((stage, index) => ({ stage, count: counts[index], conversion_percentage: index ? percentages[index] : null })),
    global_completion_conversion_percentage: globalPercentage,
    delays: {
      request_to_first_proposal: delay(0),
      proposal_to_confirmed_hiring: delay(1),
      confirmed_hiring_to_reported_completion: delay(2),
      reported_completion_to_full_payment: delay(3),
    },
  };
  return {
    period: { from: "2026-08-25T03:00:00Z", to: "2026-09-25T03:00:00Z" },
    timezone: "America/Argentina/Buenos_Aires",
    observed_at: "2026-10-01T12:00:00Z",
    category_id: null,
    rounding: "half_up",
    decimal_places: 2,
    cohorts: { ai: cohort, manual: { ...cohort, category_source: "provider.current_category_id" } },
  };
}

export const mockFunnelData = funnelFixture([250, 180, 140, 105, 88, 84, 80], [100, 72, 77.78, 75, 83, 95.45, 95.24], 35.2, [240, 360, 2880, 60]);
export const mockFunnel30Days = funnelFixture([320, 240, 190, 160, 150, 147, 144], [100, 75, 79, 84, 94, 98, 97.96], 46.88, [200, 300, 2400, 60]);
export const mockFunnelPlomeria = funnelFixture([95, 70, 52, 38, 30, 28, 27], [100, 74, 74, 73, 79, 93.33, 96.43], 31.58, [180, 250, 2100, 60]);
export const mockEmptyFunnel = funnelFixture([0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0]);

export const expectedSteps = [
  { testId: "funnel-step-ai_diagnostics", label: "Diagnósticos IA", count: "250" },
  { testId: "funnel-step-requests_created", label: "Solicitudes publicadas", count: "180" },
  { testId: "funnel-step-proposals_sent", label: "Propuestas comerciales", count: "140" },
  { testId: "funnel-step-deposits_paid", label: "Señas pagadas", count: "105" },
  { testId: "funnel-step-orders_completed", label: "Órdenes concluidas", count: "88" },
  { testId: "funnel-step-full_payments", label: "Pagos completos", count: "84" },
  { testId: "funnel-step-reviews_submitted", label: "Reseñas enviadas", count: "80" },
];

export const mockCategories = [
  { id: 47, name: "Plomería", enabled: true, version: 1 },
  { id: 83, name: "Climatización", enabled: true, version: 1 },
  { id: 12, name: "Gas", enabled: true, version: 1 },
];
