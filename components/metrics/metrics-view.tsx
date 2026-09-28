"use client";

import type { ConversionFunnel } from "@/domain/metrics/funnel";
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
import { useMetricsFunnel } from "./use-metrics-funnel";

export interface MetricsViewProps {
  initialResult?: GetFunnelActionResult;
  data?: ConversionFunnel | null;
  error?: string | null;
  isForbidden?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
  selectedPeriod?: PeriodOption;
  onPeriodChange?: (period: PeriodOption) => void;
  selectedCategoryId?: number | "";
  onCategoryChange?: (categoryId: number | "") => void;
  categoryOptions?: readonly CategoryOption[];
}

function MetricsHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight text-[#1A2B48]">{title}</h1>
      <p className="mt-1 text-sm text-[#536176]">{subtitle}</p>
    </header>
  );
}

function MetricsStepsGrid({
  steps,
  maxCount,
}: {
  steps: ConversionFunnel["steps"];
  maxCount: number;
}) {
  return (
    <section aria-label="Detalle de etapas del embudo" className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A2B48]">
        Etapas del Embudo y Conversión Relativa
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <FunnelStepCard
            key={step.stepName}
            step={step}
            index={index}
            totalSteps={steps.length}
            maxCount={maxCount}
          />
        ))}
      </div>
    </section>
  );
}

interface MetricsFunnelContentProps {
  data: ConversionFunnel;
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

  const maxCount =
    data.steps.length > 0 ? Math.max(...data.steps.map((s) => s.count), 1) : 1;

  return (
    <div className="space-y-6">
      <FunnelFiltersBar
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
      {hasInsufficientVolume ? (
        <FunnelEmptyState />
      ) : (
        <>
          <FunnelOverviewCard
            globalConversionRate={data.globalConversionRate}
            initialCount={data.steps[0]?.count}
            finalCount={data.steps[data.steps.length - 1]?.count}
          />
          <FunnelChart steps={data.steps} />
          <MetricsStepsGrid steps={data.steps} maxCount={maxCount} />
        </>
      )}
    </div>
  );
}

export function MetricsView(props: MetricsViewProps) {
  const t = translations.metrics;
  const funnel = useMetricsFunnel(props);

  if (props.isLoading || funnel.isLoading) {
    return <FunnelSkeleton />;
  }

  if (funnel.isForbidden || funnel.error) {
    return (
      <MetricsAlertState
        isForbidden={funnel.isForbidden}
        error={funnel.error}
        onRetry={props.onRetry ?? funnel.handleRetry}
      />
    );
  }

  if (!funnel.data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <MetricsHeader title={t.title} subtitle={t.subtitle} />
      <MetricsFunnelContent
        data={funnel.data}
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
