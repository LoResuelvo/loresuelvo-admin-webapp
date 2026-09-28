import { afterEach, describe, expect, it, vi } from "vitest";
import { MetricError } from "@/domain/metrics/metric-error";
import { apiMetricRepository } from "./api-metric-repository";

describe("apiMetricRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleFunnelResponse = {
    time_range: { from: "2026-08-25", to: "2026-09-24" },
    global_conversion_rate: 0.32,
    steps: [
      {
        step_name: "ai_diagnostics",
        count: 250,
        relative_conversion: 1.0,
        avg_duration_minutes: null,
      },
      {
        step_name: "requests_created",
        count: 180,
        relative_conversion: 0.72,
        avg_duration_minutes: 15,
      },
    ],
  };

  it("calls /admin/metrics/funnel with auth bearer token and parameters", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(sampleFunnelResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiMetricRepository.getFunnel("my-token", {
      from: "2026-08-25",
      to: "2026-09-24",
      categoryId: 3,
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/metrics/funnel?from=2026-08-25&to=2026-09-24&category_id=3",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result.globalConversionRate).toBe(0.32);
    expect(result.steps).toHaveLength(2);
  });

  it("throws forbidden MetricError on 403 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(apiMetricRepository.getFunnel("my-token")).rejects.toThrow(MetricError);
    await expect(apiMetricRepository.getFunnel("my-token")).rejects.toMatchObject({
      code: "forbidden",
    });
  });

  it("throws unavailable MetricError on 500 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Error", { status: 500 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(apiMetricRepository.getFunnel("my-token")).rejects.toThrow(MetricError);
    await expect(apiMetricRepository.getFunnel("my-token")).rejects.toMatchObject({
      code: "unavailable",
    });
  });
});
