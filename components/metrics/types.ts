import type { FunnelSource, FunnelStepMetric } from "@/domain/metrics/funnel";

export type {
  FunnelStepName,
  FunnelStepMetric,
  ConversionFunnel,
  FunnelFilters,
  FunnelSource,
} from "@/domain/metrics/funnel";

export type FunnelView = FunnelSource | "comparison";

export type FunnelStepData = FunnelStepMetric;

