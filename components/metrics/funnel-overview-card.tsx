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
  const formattedRate = formatPercentage(globalConversionRate);
  const isAiRequest = source === "ai" && initialUnit === "request";
  const initialUnitLabel = isAiRequest
    ? t.source.initialUnits.ai_request
    : t.source.initialUnits[initialUnit];
  const description = isAiRequest
    ? t.overview.description.aiComparison
    : t.overview.description[source];

  return (
    <section
      aria-label={t.overview.ariaLabel}
      className="p-6 rounded-2xl bg-gradient-to-br from-[#1A2B48] to-[#147560] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div>
        <p className="text-xs uppercase font-semibold tracking-wider text-emerald-200">
          {t.overview.performance}
        </p>
        <h2 className="text-xl font-bold mt-1 tracking-tight">
          {t.globalConversionRate}
        </h2>
        <p className="text-xs text-white/80 mt-1 max-w-md">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-6 self-start md:self-auto">
        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/15">
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

        <div className="text-xs text-white/80 space-y-1">
          <p>{t.overview.numerator}: <strong className="text-white">{globalConversionNumerator}</strong></p>
          <p>{t.overview.denominator}: <strong className="text-white">{globalConversionDenominator} {initialUnitLabel}</strong></p>
        </div>
      </div>
    </section>
  );
}
