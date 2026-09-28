export const mockFunnelData = {
  time_range: { from: "2026-08-25", to: "2026-09-24" },
  global_conversion_rate: 0.32,
  steps: [
    { step_name: "ai_diagnostics", count: 250, relative_conversion: 1.0, avg_duration_minutes: null },
    { step_name: "requests_created", count: 180, relative_conversion: 0.72, avg_duration_minutes: 15 },
    { step_name: "proposals_sent", count: 140, relative_conversion: 0.77, avg_duration_minutes: 240 },
    { step_name: "deposits_paid", count: 105, relative_conversion: 0.75, avg_duration_minutes: 360 },
    { step_name: "orders_completed", count: 88, relative_conversion: 0.83, avg_duration_minutes: 2880 },
    { step_name: "reviews_submitted", count: 80, relative_conversion: 0.90, avg_duration_minutes: 1440 },
  ],
};

export const mockFunnel30Days = {
  time_range: { from: "2026-08-25", to: "2026-09-24" },
  global_conversion_rate: 0.45,
  steps: [
    { step_name: "ai_diagnostics", count: 320, relative_conversion: 1.0, avg_duration_minutes: null },
    { step_name: "requests_created", count: 240, relative_conversion: 0.75, avg_duration_minutes: 12 },
    { step_name: "proposals_sent", count: 190, relative_conversion: 0.79, avg_duration_minutes: 200 },
    { step_name: "deposits_paid", count: 160, relative_conversion: 0.84, avg_duration_minutes: 300 },
    { step_name: "orders_completed", count: 150, relative_conversion: 0.94, avg_duration_minutes: 2400 },
    { step_name: "reviews_submitted", count: 144, relative_conversion: 0.96, avg_duration_minutes: 1200 },
  ],
};

export const mockFunnelPlomeria = {
  time_range: { from: "2026-08-25", to: "2026-09-24" },
  global_conversion_rate: 0.28,
  steps: [
    { step_name: "ai_diagnostics", count: 95, relative_conversion: 1.0, avg_duration_minutes: null },
    { step_name: "requests_created", count: 70, relative_conversion: 0.74, avg_duration_minutes: 10 },
    { step_name: "proposals_sent", count: 52, relative_conversion: 0.74, avg_duration_minutes: 180 },
    { step_name: "deposits_paid", count: 38, relative_conversion: 0.73, avg_duration_minutes: 250 },
    { step_name: "orders_completed", count: 30, relative_conversion: 0.79, avg_duration_minutes: 2100 },
    { step_name: "reviews_submitted", count: 27, relative_conversion: 0.90, avg_duration_minutes: 900 },
  ],
};

export const mockEmptyFunnel = {
  time_range: { from: "2020-01-01", to: "2020-01-31" },
  global_conversion_rate: 0,
  steps: [],
};

export const expectedSteps = [
  { testId: "funnel-step-ai_diagnostics", label: "Diagnósticos IA", count: "250" },
  { testId: "funnel-step-requests_created", label: "Solicitudes publicadas", count: "180" },
  { testId: "funnel-step-proposals_sent", label: "Propuestas comerciales", count: "140" },
  { testId: "funnel-step-deposits_paid", label: "Señas pagadas", count: "105" },
  { testId: "funnel-step-orders_completed", label: "Órdenes concluidas", count: "88" },
  { testId: "funnel-step-reviews_submitted", label: "Reseñas enviadas", count: "80" },
];

export const mockCategories = [
  { id: 1, name: "Plomería" },
  { id: 2, name: "Electricidad" },
  { id: 3, name: "Gas" },
];

