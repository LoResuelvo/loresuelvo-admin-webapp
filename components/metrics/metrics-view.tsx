"use client";

import type { ConversionFunnel, FunnelCohort, FunnelSource } from "@/domain/metrics/funnel";
import type { GetFunnelActionResult } from "@/app/(dashboard)/metricas/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { FunnelOverviewCard } from "./funnel-overview-card";
import { FunnelChart } from "./funnel-chart";
import { FunnelStepCard } from "./funnel-step-card";
import { FunnelEmptyState } from "./funnel-empty-state";
import { FunnelSkeleton } from "./funnel-skeleton";
import { MetricsAlertState } from "./metrics-alert-state";
import {
  FunnelFiltersBar,
  type CategoryOption,
  type PeriodOption,
} from "./funnel-filters-bar";
import { MetricsComparisonSection } from "./metrics-comparison-content";
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

function MetricsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight text-[#1A2B48]">{title}</h1>
      <p className="mt-1 text-sm text-[#536176]">{subtitle}</p>
    </header>
  );
}

function MetricsStepsGrid({ steps }: { steps: FunnelCohort["steps"] }) {
  return (
    <section aria-label="Detalle de etapas del embudo" className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A2B48]">Etapas del Embudo y Conversión Relativa</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <FunnelStepCard key={step.stepName} step={step} index={index} totalSteps={steps.length} />
        ))}
      </div>
    </section>
  );
}

interface MetricsFunnelContentProps {
  data: FunnelCohort;
  source: FunnelSource;
  availableViews: readonly FunnelView[];
  selectedView: FunnelView;
  onViewChange: (view: FunnelView) => void;
  selectedPeriod: PeriodOption;
  onPeriodChange: (period: PeriodOption) => void;
  selectedCategoryId: number | "";
  onCategoryChange: (categoryId: number | "") => void;
  categoryOptions?: readonly CategoryOption[];
  fromDate?: string;
  toDate?: string;
  onFromDateChange?: (date: string) => void;
  onToDateChange?: (date: string) => void;
  onApplyFilters?: () => void;
}

function MetricsFunnelContent({
  data,
  source,
  availableViews,
  selectedView,
  onViewChange,
  selectedPeriod,
  onPeriodChange,
  selectedCategoryId,
  onCategoryChange,
  categoryOptions,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApplyFilters,
}: MetricsFunnelContentProps) {
  const hasInsufficientVolume =
    data.steps.length === 0 || data.steps.every((s) => s.count === 0);
  const t = translations.metrics;

  return (
    <div className="space-y-6">
      <FunnelFiltersBar
        availableViews={availableViews}
        selectedView={selectedView}
        onViewChange={onViewChange}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
        categoryOptions={categoryOptions}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={onFromDateChange}
        onToDateChange={onToDateChange}
        onApplyFilters={onApplyFilters}
      />
      <p data-testid="funnel-initial-unit" className="text-xs text-[#536176]">
        {t.initialUnitLabel}: {t.source.initialUnit[data.initialUnit]}
      </p>
      {hasInsufficientVolume ? (
        <FunnelEmptyState />
      ) : (
        <>
          <FunnelOverviewCard
            source={source}
            initialUnit={data.initialUnit}
            globalConversionRate={data.globalConversionRate}
            globalConversionNumerator={data.globalConversionNumerator}
            globalConversionDenominator={data.globalConversionDenominator}
          />
          <FunnelChart steps={data.steps} />
          <MetricsStepsGrid steps={data.steps} />
        </>
      )}
    </div>
  );
}

function resolveSelectedView(
  availableViews: readonly FunnelView[],
  currentView: FunnelView,
): FunnelView {
  return availableViews.includes(currentView)
    ? currentView
    : (availableViews[0] ?? "ai");
}

function resolveSelectedSource(
  selectedView: FunnelView,
  availableSources: readonly FunnelSource[],
): FunnelSource {
  return selectedView === "ai" || selectedView === "manual"
    ? selectedView
    : (availableSources[0] ?? "ai");
}

function MetricsCohortSection({
  funnel,
  props,
  availableViews,
  selectedView,
  availableSources,
}: {
  funnel: ReturnType<typeof useMetricsFunnel>;
  props: MetricsViewProps;
  availableViews: readonly FunnelView[];
  selectedView: FunnelView;
  availableSources: readonly FunnelSource[];
}) {
  if (!funnel.data) return null;
  const selectedSource = resolveSelectedSource(selectedView, availableSources);
  const cohort = funnel.data.cohorts[selectedSource];
  if (!cohort) return null;
  const t = translations.metrics;

  return (
    <div className="space-y-6">
      <MetricsHeader title={t.title} subtitle={t.subtitle} />
      <MetricsFunnelContent
        data={cohort}
        source={selectedSource}
        availableViews={availableViews}
        selectedView={selectedView}
        onViewChange={funnel.handleViewChange}
        selectedPeriod={funnel.selectedPeriod}
        onPeriodChange={funnel.handlePeriodChange}
        selectedCategoryId={funnel.selectedCategoryId}
        onCategoryChange={funnel.handleCategoryChange}
        categoryOptions={props.categoryOptions}
        fromDate={funnel.fromDate}
        toDate={funnel.toDate}
        onFromDateChange={funnel.handleFromDateChange}
        onToDateChange={funnel.handleToDateChange}
        onApplyFilters={funnel.handleApplyFilters}
      />
    </div>
  );
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
