export type FunnelStepName =
  | "ai_diagnostics"
  | "requests_created"
  | "proposals_sent"
  | "deposits_paid"
  | "orders_completed"
  | "reviews_submitted";

export interface FunnelStepData {
  stepName: FunnelStepName;
  label: string;
  count: number;
  relativeConversion: number;
  avgDurationMinutes?: number | null;
}
