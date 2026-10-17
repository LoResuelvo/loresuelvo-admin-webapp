export type FunnelStepName =
  | "ai_diagnostics"
  | "requests_created"
  | "proposals_sent"
  | "deposits_paid"
  | "orders_completed"
  | "full_payments"
  | "reviews_submitted";

export type FunnelStepMetric = Readonly<{
  stepName: FunnelStepName;
  label: string;
  count: number;
  relativeConversion: number;
  avgDurationMinutes?: number | null;
}>;

export type ConversionFunnel = Readonly<{
  from: string;
  to: string;
  globalConversionRate: number;
  steps: FunnelStepMetric[];
}>;

export type FunnelFilters = Readonly<{
  from?: string;
  to?: string;
  categoryId?: number;
}>;
