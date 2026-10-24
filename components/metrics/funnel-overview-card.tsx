import { translations } from "@/infrastructure/i18n/translations";
import type { FunnelInitialUnit, FunnelSource } from "@/domain/metrics/funnel";
import { formatPercentage } from "./formatters";

export interface FunnelOverviewCardProps {
  source: FunnelSource;
  initialUnit: FunnelInitialUnit;
  globalConversionRate: number | null;
  globalConversionNumerator: number;
  globalConversionDenominator: number;
}

export function FunnelOverviewCard({
  source,
  initialUnit,
  globalConversionRate,
  globalConversionNumerator,
  globalConversionDenominator,
}: FunnelOverviewCardProps) {
  const t = translations.metrics;
  const formattedRate =
    globalConversionRate === null ? t.unavailable : formatPercentage(globalConversionRate);
  const isAiRequest = source === "ai" && initialUnit === "request";
  const initialUnitLabel = isAiRequest
    ? t.source.initialUnits.ai_request
    : t.source.initialUnits[initialUnit];
  const numeratorLabel = globalConversionNumerator === 1
    ? t.overview.numeratorSingular
    : t.overview.numerator.toLowerCase();
  const description = isAiRequest
    ? t.overview.description.aiComparison
    : t.overview.description[source];

  return (
    <section
      aria-label={t.overview.ariaLabel}
      className="flex flex-col gap-5 rounded-md border border-[#dce1e5] bg-white p-5 text-[#1A2B48] sm:p-6 md:flex-row md:items-center md:justify-between"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#536176]">
          {t.overview.performance}
        </p>
        <h2 className="text-lg font-semibold mt-1 tracking-tight">
          {t.globalConversionRate}
        </h2>
        <details className="mt-3 max-w-md rounded-lg text-sm text-[#536176] marker:text-[#536176]">
          <summary className="w-fit cursor-pointer rounded-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#147560]">
            {t.methodologySummary}
          </summary>
          <p className="pt-2 leading-relaxed">{description}</p>
        </details>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
        <div className="border-l-2 border-[#147560] px-5 py-2">
          <span className="block text-xs font-medium text-[#536176]">
            {t.overview.rate}
          </span>
          <span
            data-testid="global-conversion-rate"
            className="text-3xl font-semibold text-[#1A2B48] tracking-tight"
          >
            {formattedRate}
          </span>
        </div>

        <div className="border-l border-[#dce1e5] px-5 py-2 text-[#536176]">
          <span className="block text-xs font-medium text-[#536176]">
            {t.overview.numerator} / {t.overview.denominator}
          </span>
          <span
            data-testid="global-conversion-count"
            aria-label={`${globalConversionNumerator} ${numeratorLabel} de ${globalConversionDenominator} ${initialUnitLabel}`}
            className="mt-1 block text-2xl font-semibold tracking-tight text-[#1A2B48]"
          >
            {globalConversionNumerator.toLocaleString("es-AR")} de {globalConversionDenominator.toLocaleString("es-AR")}
          </span>
          <span className="mt-1 block text-xs text-[#536176]">{initialUnitLabel}</span>
        </div>
      </div>
    </section>
  );
}
