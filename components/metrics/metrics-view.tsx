"use client";

import type { ConversionFunnel, FunnelSource } from "@/domain/metrics/funnel";
import type { GetFunnelActionResult } from "@/app/(dashboard)/metricas/actions";
import { FunnelSkeleton } from "./funnel-skeleton";
import { MetricsAlertState } from "./metrics-alert-state";
import type {
  CategoryOption,
  PeriodOption,
} from "./funnel-filters-bar";
import { MetricsComparisonSection } from "./metrics-comparison-content";
import { MetricsCohortSection } from "./metrics-cohort-content";
import type { FunnelView } from "./types";
import { useMetricsFunnel } from "./use-metrics-funnel";

export interface MetricsViewProps {
  initialResult?: GetFunnelActionResult;
  data?: ConversionFunnel | null;
  error?: string | null;
  isForbidden?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
  selectedSource?: FunnelSource;
  onSourceChange?: (source: FunnelSource) => void;
  selectedView?: FunnelView;
  onViewChange?: (view: FunnelView) => void;
  selectedPeriod?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
  categoryOptions?: readonly CategoryOption[];
  initialFromDate?: string;
  initialToDate?: string;
}

function resolveSelectedView(
  availableViews: readonly FunnelView[],
  currentView: FunnelView,
): FunnelView {
  return availableViews.includes(currentView)
    ? currentView
    : (availableViews[0] ?? "ai");
}

export function MetricsView(props: MetricsViewProps) {
  const funnel = useMetricsFunnel(props);

  if (props.isLoading || funnel.isLoading) return <FunnelSkeleton />;
  if (funnel.isForbidden || funnel.error) {
    return (
      <MetricsAlertState
        isForbidden={funnel.isForbidden}
        error={funnel.error}
        onRetry={props.onRetry ?? funnel.handleRetry}
      />
    );
  }

  if (!funnel.data) return null;

  const sourceOptions: readonly FunnelSource[] = ["ai", "manual"];
  const availableSources = sourceOptions.filter(
    (source) => funnel.data?.cohorts[source] !== undefined,
  );
  const availableViews: readonly FunnelView[] = [
    ...availableSources,
    ...(funnel.data.requestComparison ? (["comparison"] as const) : []),
  ];
  const selectedView = resolveSelectedView(availableViews, funnel.selectedView);

  if (selectedView === "comparison" && funnel.data.requestComparison) {
    return (
      <MetricsComparisonSection
        funnel={funnel}
        props={props}
        availableViews={availableViews}
        selectedView={selectedView}
      />
    );
  }

  return (
    <MetricsCohortSection
      funnel={funnel}
      props={props}
      availableViews={availableViews}
      selectedView={selectedView}
      availableSources={availableSources}
    />
  );
}
