import { describe, expect, it, vi } from "vitest";
import {
  getConversionFunnel,
  GetConversionFunnelUseCase,
} from "./get-conversion-funnel";
import type { MetricRepository } from "@/ports/metrics/metric-repository";
import type { ConversionFunnel } from "@/domain/metrics/funnel";

describe("getConversionFunnel use case", () => {
  const mockFunnel: ConversionFunnel = {
    from: "2026-08-25",
    to: "2026-09-24",
    globalConversionRate: 0.32,
    steps: [],
  };

  it("delegates call to repository via getConversionFunnel function", async () => {
    const repository: MetricRepository = {
      getFunnel: vi.fn().mockResolvedValue(mockFunnel),
    };

    const result = await getConversionFunnel(repository, "token-123", {
      from: "2026-08-25",
      to: "2026-09-24",
    });

    expect(repository.getFunnel).toHaveBeenCalledWith("token-123", {
      from: "2026-08-25",
      to: "2026-09-24",
    });
    expect(result).toBe(mockFunnel);
  });

  it("delegates call to repository via GetConversionFunnelUseCase instance", async () => {
    const repository: MetricRepository = {
      getFunnel: vi.fn().mockResolvedValue(mockFunnel),
    };

    const useCase = new GetConversionFunnelUseCase(repository);
    const result = await useCase.execute("token-123", { categoryId: 1 });

    expect(repository.getFunnel).toHaveBeenCalledWith("token-123", {
      categoryId: 1,
    });
    expect(result).toBe(mockFunnel);
  });

  it("propagates repository errors without swallowing them", async () => {
    const repository: MetricRepository = {
      getFunnel: vi.fn().mockRejectedValue(new Error("Database error")),
    };

    await expect(getConversionFunnel(repository, "token-123")).rejects.toThrow(
      "Database error",
    );
  });
});
