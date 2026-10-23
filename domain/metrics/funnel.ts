export type FunnelStepName =
  | "ai_diagnostics"
  | "requests_created"
  | "proposals_sent"
  | "deposits_paid"
  | "orders_completed"
  | "full_payments"
  | "reviews_submitted";

export type FunnelSource = "ai" | "manual";

export type FunnelInitialUnit = "professional_assessment" | "request";

export type FunnelDelayName =
  | "requestToFirstProposal"
  | "proposalToConfirmedHiring"
  | "confirmedHiringToReportedCompletion"
  | "reportedCompletionToFullPayment";

export type FunnelDelayMetric = Readonly<{
  observations: number;
  meanSeconds: number | null;
}>;

export type FunnelStepTransition = Readonly<{
  rate: number | null;
  numerator: number;
  denominator: number;
}>;

export type FunnelStepMetric = Readonly<{
  stepName: FunnelStepName;
  label: string;
  count: number;
  conversionFromStart: number | null;
  conversionFromPrevious: FunnelStepTransition | null;
  avgDurationMinutes?: number | null;
}>;

export type FunnelCohort = Readonly<{
  source: FunnelSource;
  initialUnit: FunnelInitialUnit;
  categorySource: string | null;
  globalConversionRate: number | null;
  globalConversionNumerator: number;
  globalConversionDenominator: number;
  delays: Readonly<Partial<Record<FunnelDelayName, FunnelDelayMetric>>>;
  steps: readonly FunnelStepMetric[];
}>;

export type FunnelMetadata = Readonly<{
  timezone?: string;
  observedAt?: string;
  categoryId?: number | null;
  rounding?: string;
  decimalPlaces?: number;
}>;

export type ConversionFunnel = Readonly<{
  from: string;
  to: string;
  metadata?: FunnelMetadata;
  cohorts: Readonly<Partial<Record<FunnelSource, FunnelCohort>>>;
}>;

export type FunnelFilters = Readonly<{
  from?: string;
  to?: string;
  categoryId?: number;
}>;

export function calculateConversionRate(
  numerator: number,
  denominator: number,
): number | null {
  if (denominator <= 0) return null;
  return Number((numerator / denominator).toFixed(4));
}
