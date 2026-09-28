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
  data?: ConversionFunnel | null;
  initialError?: string | null;
  error?: string | null;
  initialForbidden?: boolean;
  isForbidden?: boolean;
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
  isLoading: boolean;
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

function resolveInitialDataState(params: UseMetricsFunnelParams) {
  const data = params.data !== undefined ? params.data : (params.initialData ?? (params.initialResult?.success ? params.initialResult.data : null));
  const error = params.error !== undefined ? params.error : (params.initialError ?? (params.initialResult && !params.initialResult.success ? params.initialResult.error : null));
  const isForbidden = params.isForbidden !== undefined ? params.isForbidden : (params.initialForbidden ?? (params.initialResult && !params.initialResult.success ? Boolean(params.initialResult.isForbidden) : false));
  return { data, error, isForbidden, isLoading: false };
}

function useDataState(params: UseMetricsFunnelParams) {
  const [state, setState] = useState<FunnelDataValues>(() => resolveInitialDataState(params));
  return { state, setState };
}

function useFunnelFetch(
  setState: React.Dispatch<React.SetStateAction<FunnelDataValues>>,
) {
  return useCallback(
    async (from: string, to: string, categoryId: number | "") => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const result = await fetchFunnelMetrics(from, to, categoryId);
        if (result.success) {
          setState({ data: result.data, error: null, isForbidden: false, isLoading: false });
        } else {
          setState({ data: null, error: result.error, isForbidden: Boolean(result.isForbidden), isLoading: false });
        }
      } catch {
        setState((prev) => ({ ...prev, error: translations.metrics.error, isLoading: false }));
      }
    },
    [setState],
  );
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
  const applyFilters = useFunnelFetch(setState);

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
    handleRetry: handleApplyFilters,
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

  const resolvedData = params.data !== undefined ? params.data : (params.initialData !== undefined ? params.initialData : state.data);
  const resolvedError = params.error !== undefined ? params.error : (params.initialError !== undefined ? params.initialError : state.error);
  const resolvedForbidden = params.isForbidden !== undefined ? params.isForbidden : (params.initialForbidden !== undefined ? params.initialForbidden : state.isForbidden);

  return {
    data: resolvedData,
    error: resolvedError,
    isForbidden: resolvedForbidden,
    isLoading: state.isLoading,
    selectedPeriod: filters.period,
    handlePeriodChange: actions.handlePeriodChange,
    selectedCategoryId: filters.categoryId,
    handleCategoryChange: actions.handleCategoryChange,
    fromDate: filters.from,
    handleFromDateChange: actions.handleFromDateChange,
    toDate: filters.to,
    handleToDateChange: actions.handleToDateChange,
    handleApplyFilters: actions.handleApplyFilters,
    handleRetry: actions.handleRetry,
  };
}
