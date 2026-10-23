"use client";

import type { FunnelCohort, FunnelSource } from "@/domain/metrics/funnel";
import { translations } from "@/infrastructure/i18n/translations";
import { FunnelOverviewCard } from "./funnel-overview-card";
import { FunnelChart } from "./funnel-chart";
import { FunnelStepCard } from "./funnel-step-card";
import {
  FunnelFiltersBar,
  type CategoryOption,
  type PeriodOption,
} from "./funnel-filters-bar";
import type { FunnelView } from "./types";
import type { MetricsViewProps } from "./metrics-view";
import type { useMetricsFunnel } from "./use-metrics-funnel";

interface FunnelComparisonPanelProps {
  source: FunnelSource;
  title: string;
  criterionText: string;
  initialUnitText: string;
  cohort: FunnelCohort;
  panelTestId: string;
  criterionTestId: string;
  initialUnitTestId: string;
}

function PanelSteps({ steps }: { steps: FunnelCohort["steps"] }) {
  return (
    <section aria-label="Detalle de etapas del embudo" className="space-y-3">
      <h3 className="text-base font-semibold text-[#1A2B48]">
        Etapas del Embudo y Conversión Relativa
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, index) => (
          <FunnelStepCard
            key={step.stepName}
            step={step}
            index={index}
            totalSteps={steps.length}
          />
        ))}
      </div>
    </section>
  );
}

function FunnelComparisonPanel({
  source,
  title,
  criterionText,
  initialUnitText,
  cohort,
  panelTestId,
  criterionTestId,
  initialUnitTestId,
}: FunnelComparisonPanelProps) {
  const t = translations.metrics;

  return (
    <section
      data-testid={panelTestId}
      aria-label={title}
      className="space-y-6 rounded-2xl border border-[#1A2B48]/10 bg-[#FAFAFA] p-4 lg:p-6 shadow-xs"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#1A2B48]">{title}</h2>
          <span
            data-testid={criterionTestId}
            className="text-xs font-medium text-[#536176] bg-white px-2.5 py-1 rounded-md border border-[#1A2B48]/10"
          >
            {criterionText}
          </span>
        </div>
        <p data-testid={initialUnitTestId} className="text-xs text-[#536176]">
          {t.initialUnitLabel}: {initialUnitText}
        </p>
      </div>

      <FunnelOverviewCard
        source={source}
        initialUnit="request"
        globalConversionRate={cohort.globalConversionRate}
        globalConversionNumerator={cohort.globalConversionNumerator}
        globalConversionDenominator={cohort.globalConversionDenominator}
      />

      <FunnelChart steps={cohort.steps} />

      <PanelSteps steps={cohort.steps} />
    </section>
  );
}

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
}: {
  comparison: Readonly<Record<FunnelSource, FunnelCohort>>;
}) {
  const t = translations.metrics;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FunnelComparisonPanel
        source="ai"
        title={t.comparison.aiTitle}
        criterionText={t.comparison.categoryCriterion}
        initialUnitText={t.source.initialUnits.ai_request}
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
  onFromDateChange,
  onToDateChange,
  onApplyFilters,
}: MetricsComparisonContentProps) {
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
      <ComparisonNotice notice={t.comparison.periodNotice} />
      <ComparisonPanels comparison={comparison} />
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
        onFromDateChange={funnel.handleFromDateChange}
        onToDateChange={funnel.handleToDateChange}
        onApplyFilters={funnel.handleApplyFilters}
      />
    </div>
  );
}
