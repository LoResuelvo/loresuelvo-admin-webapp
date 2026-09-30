import "server-only";
import type { ConversionFunnel, FunnelFilters } from "@/domain/metrics/funnel";
import { MetricError } from "@/domain/metrics/metric-error";
import type { MetricRepository } from "@/ports/metrics/metric-repository";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapConversionFunnel } from "./metric-mapper";

function matchesFunnelFilters(endpoint: string, filters?: FunnelFilters): boolean {
  const expected = new URLSearchParams();
  if (filters?.from) expected.set("from", filters.from);
  if (filters?.to) expected.set("to", filters.to);
  if (filters?.categoryId) {
    expected.set("category_id", String(filters.categoryId));
  }

  const actual = new URL(endpoint, "http://metrics-stub.local").searchParams;
  const sortedActual = Array.from(actual.entries()).sort(
    ([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
  );
  const sortedExpected = Array.from(expected.entries()).sort(
    ([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
  );

  return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
}

function isFunnelEndpoint(endpoint: string): boolean {
  const { pathname } = new URL(endpoint, "http://metrics-stub.local");
  return pathname === "/admin/metrics/funnel" || pathname === "/metrics/funnel";
}

async function getE2EFunnelStub(filters?: FunnelFilters): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    const funnelStubs = stubs.filter(
      (s) =>
        s.method === "GET" &&
        isFunnelEndpoint(s.endpoint),
    );
    if (funnelStubs.length === 0) return null;

    return funnelStubs.find((stub) => matchesFunnelFilters(stub.endpoint, filters)) ?? null;
  } catch {
    return null;
  }
}

async function resolveFunnelFromStub(stub: ApiStub): Promise<ConversionFunnel> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) {
    throw new MetricError("forbidden", "Forbidden");
  }
  if (stub.status >= 500) {
    throw new MetricError(
      "unavailable",
      `Failed to fetch funnel metrics: ${stub.status}`,
    );
  }
  if (stub.status >= 400) {
    throw new Error(`Failed to fetch funnel metrics: ${stub.status}`);
  }
  return mapConversionFunnel(stub.body);
}

function buildApiUrl(baseUrl: string, filters?: FunnelFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/metrics/funnel`);
  if (filters?.from) url.searchParams.set("from", filters.from);
  if (filters?.to) url.searchParams.set("to", filters.to);
  if (filters?.categoryId) {
    url.searchParams.set("category_id", String(filters.categoryId));
  }
  return url;
}

export const apiMetricRepository: MetricRepository = {
  async getFunnel(
    token: string,
    filters?: FunnelFilters,
  ): Promise<ConversionFunnel> {
    const stub = await getE2EFunnelStub(filters);
    if (stub) {
      return resolveFunnelFromStub(stub);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const url = buildApiUrl(baseUrl, filters);
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 403) {
      throw new MetricError("forbidden", "Forbidden");
    }
    if (response.status >= 500) {
      throw new MetricError(
        "unavailable",
        `Failed to fetch funnel metrics: ${response.status}`,
      );
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch funnel metrics: ${response.status}`);
    }

    const data = await response.json();
    return mapConversionFunnel(data);
  },
};
