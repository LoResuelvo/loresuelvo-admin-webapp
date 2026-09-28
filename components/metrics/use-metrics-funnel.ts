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
  initialFromDate?: string;
  initialToDate?: string;
}

interface FunnelFilterValues {
  period: PeriodOption;
  categoryId: number | "";
  from: string;
  to: string;
}

interface FunnelDataValues {
  data: ConversionFunnel | null;
  error: string | null;
  isForbidden: boolean;
}

async function fetchFunnelMetrics(
  from: string,
  to: string,
  categoryId: number | "",
): Promise<GetFunnelActionResult> {
  const filters: FunnelFilters = {
    from,
    to,
    ...(categoryId !== "" ? { categoryId } : {}),
  };
  return getFunnelAction(filters);
}

function useFilterState(params: UseMetricsFunnelParams) {
  const defaultDates = computeDateRange(params.selectedPeriod ?? "7d");
  const [filters, setFilters] = useState<FunnelFilterValues>({
    period: params.selectedPeriod ?? "7d",
    categoryId: params.selectedCategoryId ?? "",
    from: params.initialFromDate ?? defaultDates.from,
    to: params.initialToDate ?? defaultDates.to,
  });

  return { filters, setFilters };
}

function useDataState(params: UseMetricsFunnelParams) {
  const [state, setState] = useState<FunnelDataValues>({
    data: params.initialData ?? (params.initialResult?.success ? params.initialResult.data : null),
    error: params.initialError ?? (params.initialResult && !params.initialResult.success ? params.initialResult.error : null),
    isForbidden: params.initialForbidden ?? (params.initialResult && !params.initialResult.success ? Boolean(params.initialResult.isForbidden) : false),
  });

  return { state, setState };
}

function useFunnelActions({
  filters,
  setFilters,
  setState,
  onPeriodChange,
  onCategoryChange,
}: {
  filters: FunnelFilterValues;
  setFilters: React.Dispatch<React.SetStateAction<FunnelFilterValues>>;
  setState: React.Dispatch<React.SetStateAction<FunnelDataValues>>;
  onPeriodChange?: (period: PeriodOption) => void;
  onCategoryChange?: (categoryId: number | "") => void;
}) {
  const applyFilters = useCallback(
    async (from: string, to: string, categoryId: number | "") => {
      try {
        const result = await fetchFunnelMetrics(from, to, categoryId);
        if (result.success) {
          setState({ data: result.data, error: null, isForbidden: false });
        } else {
          setState({ data: null, error: result.error, isForbidden: Boolean(result.isForbidden) });
        }
      } catch {
        setState((prev) => ({ ...prev, error: translations.metrics.error }));
      }
    },
    [setState],
  );

  const handlePeriodChange = useCallback(
    async (period: PeriodOption) => {
      const dates = computeDateRange(period);
      setFilters((prev) => ({ ...prev, period, from: dates.from, to: dates.to }));
      onPeriodChange?.(period);
      await applyFilters(dates.from, dates.to, filters.categoryId);
    },
    [applyFilters, filters.categoryId, onPeriodChange, setFilters],
  );

  const handleCategoryChange = useCallback(
    async (categoryId: number | "") => {
      setFilters((prev) => ({ ...prev, categoryId }));
      onCategoryChange?.(categoryId);
      await applyFilters(filters.from, filters.to, categoryId);
    },
    [applyFilters, filters.from, filters.to, onCategoryChange, setFilters],
  );

  const handleApplyFilters = useCallback(async () => {
    await applyFilters(filters.from, filters.to, filters.categoryId);
  }, [applyFilters, filters]);

  return {
    handlePeriodChange,
    handleCategoryChange,
    handleApplyFilters,
    handleFromDateChange: (from: string) => setFilters((prev) => ({ ...prev, from })),
    handleToDateChange: (to: string) => setFilters((prev) => ({ ...prev, to })),
  };
}

export function useMetricsFunnel(params: UseMetricsFunnelParams) {
  const { filters, setFilters } = useFilterState(params);
  const { state, setState } = useDataState(params);
  const actions = useFunnelActions({
    filters,
    setFilters,
    setState,
    onPeriodChange: params.onPeriodChange,
    onCategoryChange: params.onCategoryChange,
  });

  return {
    data: params.initialData !== undefined ? params.initialData : state.data,
    error: params.initialError !== undefined ? params.initialError : state.error,
    isForbidden: params.initialForbidden !== undefined ? params.initialForbidden : state.isForbidden,
    selectedPeriod: filters.period,
    handlePeriodChange: actions.handlePeriodChange,
    selectedCategoryId: filters.categoryId,
    handleCategoryChange: actions.handleCategoryChange,
    fromDate: filters.from,
    handleFromDateChange: actions.handleFromDateChange,
    toDate: filters.to,
    handleToDateChange: actions.handleToDateChange,
    handleApplyFilters: actions.handleApplyFilters,
  };
}
