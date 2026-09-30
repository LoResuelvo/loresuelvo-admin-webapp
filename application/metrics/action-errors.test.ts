import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFunnelAction } from "@/app/(dashboard)/metricas/actions";
import { getConversionFunnel } from "@/application/metrics/get-conversion-funnel";
import { MetricError } from "@/domain/metrics/metric-error";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

vi.mock("@/application/metrics/get-conversion-funnel", () => ({ getConversionFunnel: vi.fn() }));
vi.mock("@/infrastructure/repositories/api-metric-repository", () => ({
  apiMetricRepository: {},
}));
vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: { getAccessToken: vi.fn() },
}));

describe("getFunnelAction user-facing errors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authSession.getAccessToken).mockResolvedValue("test-token");
  });

  it.each([
    new Error("Failed to fetch: 404"),
    new Error("Invalid response with internal details"),
    new Error("fetch failed"),
    "unexpected failure",
    new MetricError("unavailable", "Internal service details"),
  ])("returns safe Spanish guidance for %s", async (error) => {
    vi.mocked(getConversionFunnel).mockRejectedValue(error);

    expect(await getFunnelAction()).toEqual({
      success: false,
      error: translations.metrics.error,
    });
  });

  it("preserves the permission-specific message", async () => {
    vi.mocked(getConversionFunnel).mockRejectedValue(new MetricError("forbidden", "Forbidden: 403"));

    expect(await getFunnelAction()).toEqual({
      success: false,
      error: translations.metrics.forbidden,
      isForbidden: true,
    });
  });
});
