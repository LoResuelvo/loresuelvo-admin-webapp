"use client";

import type { ConversionFunnel, FunnelCohort, FunnelSource } from "@/domain/metrics/funnel";
import { translations } from "@/infrastructure/i18n/translations";
import { formatEffectivePeriod } from "./formatters";
import { FunnelMetadataBar } from "./metrics-cohort-content";
import { FunnelComparisonPanel } from "./funnel-comparison-panel";
import {
  FunnelFiltersBar,
  type CategoryOption,
  type PeriodOption,
} from "./funnel-filters-bar";
import type { FunnelView } from "./types";
import type { MetricsViewProps } from "./metrics-view";
import type { useMetricsFunnel } from "./use-metrics-funnel";

function ComparisonNotice({ notice }: { notice: string }) {
  return (
    <div
      data-testid="funnel-comparison-notice"
      role="status"
      aria-label="Aviso de período sobre solicitudes"
      className="rounded-2xl border border-[#147560]/20 bg-[#147560]/5 p-4 text-sm text-[#1A2B48] flex items-center gap-3"
    >
      <span className="text-[#147560] font-bold text-base" aria-hidden="true">ℹ</span>
      <p>{notice}</p>
    </div>
  );
}

function ComparisonPanels({
  comparison,
  effectivePeriod,
}: {
  comparison: Readonly<Record<FunnelSource, FunnelCohort>>;
  effectivePeriod?: string;
}) {
  const t = translations.metrics;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FunnelComparisonPanel
        source="ai"
        title={t.comparison.aiTitle}
        criterionText={t.comparison.categoryCriterion}
        initialUnitText={t.source.initialUnits.ai_request}
        effectivePeriod={effectivePeriod}
        cohort={comparison.ai}
        panelTestId="funnel-comparison-panel-ai"
        criterionTestId="funnel-category-criterion-ai"
        initialUnitTestId="funnel-initial-unit-ai"
      />
      <FunnelComparisonPanel
        source="manual"
        title={t.comparison.manualTitle}
        criterionText={t.comparison.categoryCriterion}
        initialUnitText={t.source.initialUnits.request}
        effectivePeriod={effectivePeriod}
        cohort={comparison.manual}
        panelTestId="funnel-comparison-panel-manual"
        criterionTestId="funnel-category-criterion-manual"
        initialUnitTestId="funnel-initial-unit-manual"
      />
    </div>
  );
}

export interface MetricsComparisonContentProps {
  comparison: Readonly<Record<FunnelSource, FunnelCohort>>;
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

export function MetricsComparisonContent({
  comparison,
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
}: MetricsComparisonContentProps) {
  const t = translations.metrics;
  const effectivePeriod = formatEffectivePeriod(
    effectiveFrom,
    effectiveTo,
    metadata?.timezone,
  );

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
      <ComparisonNotice notice={t.comparison.periodNotice} />
      <ComparisonPanels comparison={comparison} effectivePeriod={effectivePeriod} />
    </div>
  );
}

export function MetricsComparisonSection({
  funnel,
  props,
  availableViews,
  selectedView,
}: {
  funnel: ReturnType<typeof useMetricsFunnel>;
  props: MetricsViewProps;
  availableViews: readonly FunnelView[];
  selectedView: FunnelView;
}) {
  if (!funnel.data?.requestComparison) return null;
  const t = translations.metrics;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A2B48]">{t.title}</h1>
        <p className="mt-1 text-sm text-[#536176]">{t.subtitle}</p>
      </header>
      <MetricsComparisonContent
        comparison={funnel.data.requestComparison}
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
