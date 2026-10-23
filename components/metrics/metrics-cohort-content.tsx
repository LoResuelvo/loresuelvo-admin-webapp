"use client";

import type { ConversionFunnel, FunnelCohort, FunnelSource } from "@/domain/metrics/funnel";
import { translations } from "@/infrastructure/i18n/translations";
import { formatEffectivePeriod, formatObservationDate } from "./formatters";
import { FunnelOverviewCard } from "./funnel-overview-card";
import { FunnelChart } from "./funnel-chart";
import { FunnelStepCard } from "./funnel-step-card";
import { FunnelEmptyState } from "./funnel-empty-state";
import {
  FunnelFiltersBar,
  type CategoryOption,
  type PeriodOption,
} from "./funnel-filters-bar";
import type { FunnelView } from "./types";
import type { MetricsViewProps } from "./metrics-view";
import type { useMetricsFunnel } from "./use-metrics-funnel";

export function MetricsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight text-[#1A2B48]">{title}</h1>
      <p className="mt-1 text-sm text-[#536176]">{subtitle}</p>
    </header>
  );
}

export function FunnelMetadataBar({
  from,
  to,
  metadata,
}: {
  from?: string;
  to?: string;
  metadata?: ConversionFunnel["metadata"];
}) {
  const t = translations.metrics;
  if (!from || !to) return null;
  const effectivePeriod = formatEffectivePeriod(from, to, metadata?.timezone);
  const observation = formatObservationDate(metadata?.observedAt, metadata?.timezone);

  return (
    <div
      data-testid="funnel-metadata-bar"
      className="flex flex-wrap items-center gap-4 text-xs text-[#536176] bg-white border border-[#1A2B48]/10 rounded-xl px-4 py-2.5 shadow-xs"
    >
      <div>
        <span className="font-semibold text-[#1A2B48]">{t.effectivePeriod}: </span>
        <span data-testid="funnel-effective-period">{effectivePeriod}</span>
      </div>
      {observation ? (
        <div>
          <span className="font-semibold text-[#1A2B48]">{t.observedAt}: </span>
          <span data-testid="funnel-observation-date">{observation}</span>
        </div>
      ) : null}
    </div>
  );
}

export function MetricsStepsGrid({ steps }: { steps: FunnelCohort["steps"] }) {
  const t = translations.metrics;
  return (
    <section aria-label="Detalle de etapas del embudo" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#1A2B48]">Etapas del Embudo y Conversión Relativa</h2>
        <p data-testid="funnel-delays-notice" className="text-xs text-[#536176]">
          ℹ {t.delays.notice}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <FunnelStepCard key={step.stepName} step={step} index={index} totalSteps={steps.length} />
        ))}
      </div>
    </section>
  );
}

export interface MetricsFunnelContentProps {
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
  effectiveFrom?: string;
  effectiveTo?: string;
  metadata?: ConversionFunnel["metadata"];
  onFromDateChange?: (date: string) => void;
  onToDateChange?: (date: string) => void;
  onApplyFilters?: () => void;
}

function CohortOverview({
  data,
  source,
  hasInsufficientVolume,
}: {
  data: FunnelCohort;
  source: FunnelSource;
  hasInsufficientVolume: boolean;
}) {
  if (hasInsufficientVolume) {
    return <FunnelEmptyState />;
  }
  return (
    <FunnelOverviewCard
      source={source}
      initialUnit={data.initialUnit}
      globalConversionRate={data.globalConversionRate}
      globalConversionNumerator={data.globalConversionNumerator}
      globalConversionDenominator={data.globalConversionDenominator}
    />
  );
}

export function MetricsFunnelContent({
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
  effectiveFrom,
  effectiveTo,
  metadata,
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
      <FunnelMetadataBar from={effectiveFrom} to={effectiveTo} metadata={metadata} />
      <p data-testid="funnel-initial-unit" className="text-xs text-[#536176]">
        {t.initialUnitLabel}: {t.source.initialUnit[data.initialUnit]}
      </p>
      <CohortOverview
        data={data}
        source={source}
        hasInsufficientVolume={hasInsufficientVolume}
      />
      {data.steps.length > 0 && (
        <>
          <FunnelChart steps={data.steps} />
          <MetricsStepsGrid steps={data.steps} />
        </>
      )}
    </div>
  );
}

function resolveSelectedSource(
  selectedView: FunnelView,
  availableSources: readonly FunnelSource[],
): FunnelSource {
  return selectedView === "ai" || selectedView === "manual"
    ? selectedView
    : (availableSources[0] ?? "ai");
}

export function MetricsCohortSection({
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
        effectiveFrom={funnel.data.from}
        effectiveTo={funnel.data.to}
        metadata={funnel.data.metadata}
        onFromDateChange={funnel.handleFromDateChange}
        onToDateChange={funnel.handleToDateChange}
        onApplyFilters={funnel.handleApplyFilters}
      />
    </div>
  );
}
