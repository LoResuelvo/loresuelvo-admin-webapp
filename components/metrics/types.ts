import type { FunnelStepMetric, FunnelStepName } from "@/domain/metrics/funnel";

export type {
  FunnelStepName,
  FunnelStepMetric,
  ConversionFunnel,
  FunnelFilters,
} from "@/domain/metrics/funnel";

export type FunnelStepData = FunnelStepMetric;
