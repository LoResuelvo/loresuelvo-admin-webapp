"use server";

import type { ConversionFunnel, FunnelFilters } from "@/domain/metrics/funnel";
import { MetricError } from "@/domain/metrics/metric-error";
import { getConversionFunnel } from "@/application/metrics/get-conversion-funnel";
import { apiMetricRepository } from "@/infrastructure/repositories/api-metric-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetFunnelActionResult =
  | { success: true; data: ConversionFunnel }
  | { success: false; error: string; isForbidden?: boolean };

async function resolveAuthToken(): Promise<string> {
  try {
    return await authSession.getAccessToken();
  } catch {
    if (process.env.APP_ENV === "production") {
      throw new Error("unauthenticated");
    }
    return "mock-token";
  }
}

export async function getFunnelAction(
  filters?: FunnelFilters,
): Promise<GetFunnelActionResult> {
  try {
    const token = await resolveAuthToken();
    const data = await getConversionFunnel(apiMetricRepository, token, filters);
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof MetricError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: translations.metrics.forbidden,
          isForbidden: true,
        };
      }
      return {
        success: false,
        error: translations.metrics.error,
      };
    }
    const message =
      error instanceof Error ? error.message : translations.metrics.error;
    return { success: false, error: message };
  }
}
