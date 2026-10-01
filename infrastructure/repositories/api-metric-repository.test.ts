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

  it("calls /admin/metrics/funnel with auth bearer token and RFC 3339 parameters", async () => {
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
      "https://api.example.com/admin/metrics/funnel?from=2026-08-25T00%3A00%3A00Z&to=2026-09-24T23%3A59%3A59Z&category_id=3",
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

  it("omits date bounds when only one parameter is supplied", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(sampleFunnelResponse)));
    vi.stubGlobal("fetch", fetcher);

    await apiMetricRepository.getFunnel("my-token", {
      from: "2026-08-25",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/metrics/funnel",
      expect.anything(),
    );
  });

  it("processes official OpenAPI response correctly through repository", async () => {
    const openApiResponse = {
      period: { from: "2026-09-10T00:00:00Z", to: "2026-09-11T00:00:00Z" },
      timezone: "America/Argentina/Buenos_Aires",
      observed_at: "2026-09-30T15:00:00Z",
      category_id: null,
      rounding: "half_up",
      decimal_places: 2,
      cohorts: {
        ai: {
          category_source: "assessment.problem_category_id",
          stages: [
            { stage: "professional_assessment", count: 3, conversion_percentage: null },
            { stage: "request", count: 2, conversion_percentage: 66.67 },
            { stage: "proposal", count: 2, conversion_percentage: 100.0 },
            { stage: "confirmed_hiring", count: 2, conversion_percentage: 100.0 },
            { stage: "reported_completion", count: 2, conversion_percentage: 100.0 },
            { stage: "full_payment", count: 1, conversion_percentage: 50.0 },
            { stage: "review", count: 1, conversion_percentage: 100.0 },
          ],
          global_completion_conversion_percentage: 66.67,
          delays: {
            request_to_first_proposal: { observations: 2, mean_seconds: 33.34 },
            proposal_to_confirmed_hiring: { observations: 3, mean_seconds: 14.17 },
            confirmed_hiring_to_reported_completion: { observations: 2, mean_seconds: 172820.0 },
            reported_completion_to_full_payment: { observations: 1, mean_seconds: 40.0 },
          },
        },
      },
    };

    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(openApiResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiMetricRepository.getFunnel("my-token");

    expect(result.from).toBe("2026-09-10T00:00:00Z");
    expect(result.to).toBe("2026-09-11T00:00:00Z");
    expect(result.globalConversionRate).toBe(0.6667);
    expect(result.steps).toHaveLength(6);
    expect(result.steps[0].stepName).toBe("ai_diagnostics");
    expect(result.steps[0].count).toBe(3);
    expect(result.steps[4].stepName).toBe("orders_completed");
    expect(result.steps[4].avgDurationMinutes).toBe(2880);
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
