import { useCallback, useState } from "react";
import type { ConversionFunnel, FunnelFilters } from "@/domain/metrics/funnel";
import {
  getFunnelAction,
  type GetFunnelActionResult,
} from "@/app/(dashboard)/metricas/actions";
import { translations } from "@/infrastructure/i18n/translations";
import {
  computeDateRange,
  type PeriodOption,
} from "./funnel-filters-bar";

export interface UseMetricsFunnelParams {
  initialResult?: GetFunnelActionResult;
  initialData?: ConversionFunnel | null;
  initialError?: string | null;
  initialForbidden?: boolean;
  selectedPeriod?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
}

async function fetchFunnelMetrics(
  period: PeriodOption,
  categoryId: number | "",
): Promise<GetFunnelActionResult> {
  const { from, to } = computeDateRange(period);
  const filters: FunnelFilters = {
    from,
    to,
    ...(categoryId !== "" ? { categoryId } : {}),
  };
  return getFunnelAction(filters);
}

function useMetricsInitialState(params: UseMetricsFunnelParams) {
  const [data, setData] = useState<ConversionFunnel | null>(
    params.initialData ?? (params.initialResult?.success ? params.initialResult.data : null),
  );
  const [error, setError] = useState<string | null>(
    params.initialError ??
      (params.initialResult && !params.initialResult.success ? params.initialResult.error : null),
  );
  const [isForbidden, setIsForbidden] = useState<boolean>(
    params.initialForbidden ??
      (params.initialResult && !params.initialResult.success
        ? Boolean(params.initialResult.isForbidden)
        : false),
  );
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(
    params.selectedPeriod ?? "7d",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">(
    params.selectedCategoryId ?? "",
  );

  return {
    data,
    setData,
    error,
    setError,
    isForbidden,
    setIsForbidden,
    selectedPeriod,
    setSelectedPeriod,
    selectedCategoryId,
    setSelectedCategoryId,
  };
}

export function useMetricsFunnel(params: UseMetricsFunnelParams) {
  const state = useMetricsInitialState(params);

  const applyFilters = useCallback(
    async (period: PeriodOption, categoryId: number | "") => {
      try {
        const result = await fetchFunnelMetrics(period, categoryId);
        if (result.success) {
          state.setData(result.data);
          state.setError(null);
          state.setIsForbidden(false);
        } else {
          if (result.isForbidden) state.setIsForbidden(true);
          state.setError(result.error);
        }
      } catch {
        state.setError(translations.metrics.error);
      }
    },
    [state],
  );

  const handlePeriodChange = useCallback(
    async (newPeriod: PeriodOption) => {
      state.setSelectedPeriod(newPeriod);
      params.onPeriodChange?.(newPeriod);
      await applyFilters(newPeriod, state.selectedCategoryId);
    },
    [applyFilters, params, state],
  );

  const handleCategoryChange = useCallback(
    async (newCategory: number | "") => {
      state.setSelectedCategoryId(newCategory);
      params.onCategoryChange?.(newCategory);
      await applyFilters(state.selectedPeriod, newCategory);
    },
    [applyFilters, params, state],
  );

  return {
    data: params.initialData !== undefined ? params.initialData : state.data,
    error: params.initialError !== undefined ? params.initialError : state.error,
    isForbidden:
      params.initialForbidden !== undefined ? params.initialForbidden : state.isForbidden,
    selectedPeriod: state.selectedPeriod,
    handlePeriodChange,
    selectedCategoryId: state.selectedCategoryId,
    handleCategoryChange,
  };
}
