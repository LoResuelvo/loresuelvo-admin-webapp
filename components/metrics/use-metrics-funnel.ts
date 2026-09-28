import { useCallback, useState } from "react";
import type { ConversionFunnel } from "@/domain/metrics/funnel";
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
}

export function useMetricsFunnel({
  initialResult,
  initialData,
  initialError,
  initialForbidden,
  selectedPeriod: propSelectedPeriod,
  onPeriodChange: onPeriodChangeProp,
}: UseMetricsFunnelParams) {
  const [data, setData] = useState<ConversionFunnel | null>(
    initialData ?? (initialResult?.success ? initialResult.data : null),
  );
  const [error, setError] = useState<string | null>(
    initialError ??
      (initialResult && !initialResult.success ? initialResult.error : null),
  );
  const [isForbidden, setIsForbidden] = useState<boolean>(
    initialForbidden ??
      (initialResult && !initialResult.success
        ? Boolean(initialResult.isForbidden)
        : false),
  );
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(
    propSelectedPeriod ?? "7d",
  );

  const handlePeriodChange = useCallback(
    async (newPeriod: PeriodOption) => {
      setSelectedPeriod(newPeriod);
      onPeriodChangeProp?.(newPeriod);

      try {
        const { from, to } = computeDateRange(newPeriod);
        const result = await getFunnelAction({ from, to });
        if (result.success) {
          setData(result.data);
          setError(null);
          setIsForbidden(false);
        } else {
          if (result.isForbidden) {
            setIsForbidden(true);
          }
          setError(result.error);
        }
      } catch {
        setError(translations.metrics.error);
      }
    },
    [onPeriodChangeProp],
  );

  return {
    data: initialData !== undefined ? initialData : data,
    error: initialError !== undefined ? initialError : error,
    isForbidden:
      initialForbidden !== undefined ? initialForbidden : isForbidden,
    selectedPeriod,
    handlePeriodChange,
  };
}
