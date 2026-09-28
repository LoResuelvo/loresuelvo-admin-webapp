import { describe, expect, it, vi, beforeEach } from "vitest";
import { getFunnelAction } from "@/app/(dashboard)/metricas/actions";
import { apiMetricRepository } from "@/infrastructure/repositories/api-metric-repository";
import { MetricError } from "@/domain/metrics/metric-error";
import { translations } from "@/infrastructure/i18n/translations";

vi.mock("@/infrastructure/repositories/api-metric-repository", () => ({
  apiMetricRepository: {
    getFunnel: vi.fn(),
  },
}));

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("test-token"),
  },
}));

describe("getFunnelAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success with funnel data", async () => {
    const mockData = {
      from: "2026-08-25",
      to: "2026-09-24",
      globalConversionRate: 0.32,
      steps: [],
    };
    vi.mocked(apiMetricRepository.getFunnel).mockResolvedValue(mockData);

    const result = await getFunnelAction({
      from: "2026-08-25",
      to: "2026-09-24",
    });

    expect(result).toEqual({ success: true, data: mockData });
    expect(apiMetricRepository.getFunnel).toHaveBeenCalledWith("test-token", {
      from: "2026-08-25",
      to: "2026-09-24",
    });
  });

  it("returns isForbidden when MetricError forbidden is thrown", async () => {
    vi.mocked(apiMetricRepository.getFunnel).mockRejectedValue(
      new MetricError("forbidden", "Forbidden"),
    );

    const result = await getFunnelAction();

    expect(result).toEqual({
      success: false,
      error: translations.metrics.forbidden,
      isForbidden: true,
    });
  });

  it("returns error message when generic error is thrown", async () => {
    vi.mocked(apiMetricRepository.getFunnel).mockRejectedValue(
      new Error("Network connection lost"),
    );

    const result = await getFunnelAction();

    expect(result).toEqual({
      success: false,
      error: "Network connection lost",
    });
  });
});
