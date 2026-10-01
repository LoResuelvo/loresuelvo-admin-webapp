import "server-only";
import type { ConversionFunnel, FunnelFilters } from "@/domain/metrics/funnel";
import { MetricError } from "@/domain/metrics/metric-error";
import type { MetricRepository } from "@/ports/metrics/metric-repository";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapConversionFunnel } from "./metric-mapper";

function matchesFunnelFilters(endpoint: string, filters?: FunnelFilters): boolean {
  const actual = new URL(endpoint, "http://metrics-stub.local").searchParams;
  const actualFrom = actual.get("from");
  const actualTo = actual.get("to");
  const actualCat = actual.get("category_id");

  const expectedFrom = filters?.from ?? null;
  const expectedTo = filters?.to ?? null;
  const expectedCat = filters?.categoryId ? String(filters.categoryId) : null;

  const matchesFrom =
    (!expectedFrom && !actualFrom) ||
    (!!expectedFrom &&
      !!actualFrom &&
      (actualFrom === expectedFrom || actualFrom.startsWith(expectedFrom)));
  const matchesTo =
    (!expectedTo && !actualTo) ||
    (!!expectedTo &&
      !!actualTo &&
      (actualTo === expectedTo || actualTo.startsWith(expectedTo)));
  const matchesCat = (!expectedCat && !actualCat) || actualCat === expectedCat;

  return matchesFrom && matchesTo && matchesCat;
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

export function formatToRfc3339(dateStr: string, isEnd = false): string {
  if (dateStr.includes("T")) {
    return dateStr;
  }
  if (isEnd) {
    const now = new Date();
    const todayPrefix = now.toISOString().slice(0, 10);
    if (dateStr >= todayPrefix) {
      return now.toISOString();
    }
    return `${dateStr}T23:59:59Z`;
  }
  return `${dateStr}T00:00:00Z`;
}

export function buildApiUrl(baseUrl: string, filters?: FunnelFilters): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/metrics/funnel`);
  if (filters?.from && filters?.to) {
    url.searchParams.set("from", formatToRfc3339(filters.from, false));
    url.searchParams.set("to", formatToRfc3339(filters.to, true));
  }
  if (
    filters?.categoryId !== undefined &&
    filters?.categoryId !== null &&
    Number.isInteger(filters.categoryId) &&
    filters.categoryId > 0 &&
    filters.categoryId <= 2147483647
  ) {
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
