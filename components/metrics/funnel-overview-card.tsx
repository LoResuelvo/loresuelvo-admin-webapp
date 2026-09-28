import { translations } from "@/infrastructure/i18n/translations";
import { formatPercentage } from "./formatters";

export interface FunnelOverviewCardProps {
  globalConversionRate: number;
  initialCount?: number;
  finalCount?: number;
}

export function FunnelOverviewCard({
  globalConversionRate,
  initialCount,
  finalCount,
}: FunnelOverviewCardProps) {
  const t = translations.metrics;
  const formattedRate = formatPercentage(globalConversionRate);

  return (
    <section
      aria-label="Resumen de conversión global"
      className="p-6 rounded-2xl bg-gradient-to-br from-[#1A2B48] to-[#147560] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      <div>
        <p className="text-xs uppercase font-semibold tracking-wider text-emerald-200">
          Rendimiento Operativo
        </p>
        <h2 className="text-xl font-bold mt-1 tracking-tight">
          {t.globalConversionRate}
        </h2>
        <p className="text-xs text-white/80 mt-1 max-w-md">
          Porcentaje de contrataciones que completaron el ciclo desde el diagnóstico inicial con IA hasta la reseña del servicio.
        </p>
      </div>

      <div className="flex items-center gap-6 self-start md:self-auto">
        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/15">
          <span className="block text-xs uppercase tracking-wider text-white/70">
            Tasa global
          </span>
          <span
            data-testid="global-conversion-rate"
            className="text-3xl font-extrabold text-white tracking-tight"
          >
            {formattedRate}
          </span>
        </div>

        {initialCount !== undefined && finalCount !== undefined ? (
          <div className="hidden sm:block text-xs text-white/80 space-y-1">
            <p>Diagnósticos: <strong className="text-white">{initialCount}</strong></p>
            <p>Reseñas: <strong className="text-white">{finalCount}</strong></p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
