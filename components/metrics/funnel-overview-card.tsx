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
      className="flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-[#1A2B48] to-[#147560] p-5 text-white shadow-md sm:p-6 md:flex-row md:items-center md:justify-between"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase font-semibold tracking-wider text-emerald-200">
          {t.overview.performance}
        </p>
        <h2 className="text-xl font-bold mt-1 tracking-tight">
          {t.globalConversionRate}
        </h2>
        <details className="mt-3 max-w-md rounded-lg text-sm text-white/85 marker:text-white/70">
          <summary className="w-fit cursor-pointer rounded-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {t.methodologySummary}
          </summary>
          <p className="pt-2 leading-relaxed">{description}</p>
        </details>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
        <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
          <span className="block text-xs uppercase tracking-wider text-white/70">
            {t.overview.rate}
          </span>
          <span
            data-testid="global-conversion-rate"
            className="text-3xl font-extrabold text-white tracking-tight"
          >
            {formattedRate}
          </span>
        </div>

        <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-4 text-white/80">
          <span className="block text-xs uppercase tracking-wider text-white/70">
            {t.overview.numerator} / {t.overview.denominator}
          </span>
          <span
            data-testid="global-conversion-count"
            aria-label={`${globalConversionNumerator} ${numeratorLabel} de ${globalConversionDenominator} ${initialUnitLabel}`}
            className="mt-1 block text-2xl font-extrabold tracking-tight text-white"
          >
            {globalConversionNumerator.toLocaleString("es-AR")} de {globalConversionDenominator.toLocaleString("es-AR")}
          </span>
          <span className="mt-1 block text-xs text-white/80">{initialUnitLabel}</span>
        </div>
      </div>
    </section>
  );
}
