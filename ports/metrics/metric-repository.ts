import type { ConversionFunnel, FunnelFilters } from "@/domain/metrics/funnel";

export interface MetricRepository {
  getFunnel(token: string, filters?: FunnelFilters): Promise<ConversionFunnel>;
}
