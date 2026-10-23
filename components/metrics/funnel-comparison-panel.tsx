"use client";

import type { FunnelCohort, FunnelSource } from "@/domain/metrics/funnel";
import { translations } from "@/infrastructure/i18n/translations";
import { FunnelOverviewCard } from "./funnel-overview-card";
import { FunnelChart } from "./funnel-chart";
import { FunnelStepCard } from "./funnel-step-card";

export interface FunnelComparisonPanelProps {
  source: FunnelSource;
  title: string;
  criterionText: string;
  initialUnitText: string;
  effectivePeriod?: string;
  cohort: FunnelCohort;
  panelTestId: string;
  criterionTestId: string;
  initialUnitTestId: string;
}

function PanelSteps({ steps }: { steps: FunnelCohort["steps"] }) {
  const t = translations.metrics;
  return (
    <section aria-label="Detalle de etapas del embudo" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[#1A2B48]">
          Etapas del Embudo y Conversión Relativa
        </h3>
        <p data-testid="funnel-delays-notice" className="text-xs text-[#536176]">
          ℹ {t.delays.notice}
        </p>
      </div>
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

export function FunnelComparisonPanel({
  source,
  title,
  criterionText,
  initialUnitText,
  effectivePeriod,
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p data-testid={initialUnitTestId} className="text-xs text-[#536176]">
            {t.initialUnitLabel}: {initialUnitText}
          </p>
          {effectivePeriod ? (
            <span
              data-testid={`funnel-effective-period-${source}`}
              className="text-xs text-[#536176]"
            >
              {t.effectivePeriod}: {effectivePeriod}
            </span>
          ) : null}
        </div>
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
