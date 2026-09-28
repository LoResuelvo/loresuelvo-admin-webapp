import type { ConversionFunnel, FunnelFilters } from "@/domain/metrics/funnel";
import type { MetricRepository } from "@/ports/metrics/metric-repository";

export async function getConversionFunnel(
  repository: MetricRepository,
  token: string,
  filters?: FunnelFilters,
): Promise<ConversionFunnel> {
  return repository.getFunnel(token, filters);
}

export class GetConversionFunnelUseCase {
  constructor(private readonly repository: MetricRepository) {}

  async execute(
    token: string,
    filters?: FunnelFilters,
  ): Promise<ConversionFunnel> {
    return this.repository.getFunnel(token, filters);
  }
}
