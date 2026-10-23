import type { FunnelStepData } from "./types";
import { formatDurationMinutes, formatPercentage } from "./formatters";
import { translations } from "@/infrastructure/i18n/translations";

export interface FunnelChartProps {
  steps: readonly FunnelStepData[];
}

function FunnelChartRow({ step }: { step: FunnelStepData }) {
  const t = translations.metrics;
  const widthPercent = step.count === 0
    ? 0
    : Math.max(0, Math.min(100, Math.round((step.conversionFromStart ?? 0) * 100)));

  return (
    <div
      data-testid={`funnel-chart-step-${step.stepName}`}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#1A2B48]">
          {step.label}
        </span>
        <div className="flex items-center gap-3 text-[#536176]">
          <span className="font-semibold text-[#1A2B48]">
            {step.count.toLocaleString("es-AR")}
          </span>
          <span>
            ({step.conversionFromStart === null ? t.unavailable : `${formatPercentage(step.conversionFromStart)} ${t.fromInitialBase}`})
          </span>
          {step.avgDurationMinutes ? (
            <span className="text-[11px] text-[#536176]/80">
              ⏱ {formatDurationMinutes(step.avgDurationMinutes)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="w-full bg-[#F4F1EE] rounded-lg h-7 p-1 flex items-center">
        <div
          data-testid={`funnel-chart-bar-${step.stepName}`}
          role="progressbar"
          aria-valuenow={widthPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${step.label}: ${step.conversionFromStart === null ? t.unavailable : `${formatPercentage(step.conversionFromStart)} ${t.fromInitialBase}`}`}
          className={`min-w-0 bg-gradient-to-r from-[#147560] to-[#1A2B48] h-full rounded-md transition-all duration-300 flex items-center text-[11px] font-semibold text-white justify-end ${widthPercent > 0 ? "px-2" : "px-0"}`}
          style={{ width: `${widthPercent}%` }}
        >
          {widthPercent >= 20 ? formatPercentage(step.conversionFromStart) : ""}
        </div>
      </div>
    </div>
  );
}

export function FunnelChart({ steps }: FunnelChartProps) {
  return (
    <section
      aria-label="Gráfico de embudo operativo"
      className="p-6 rounded-2xl bg-white border border-[#1A2B48]/10 shadow-sm"
    >
      <h2 className="text-base font-semibold text-[#1A2B48] mb-4">
        Flujo de Conversión por Etapa
      </h2>

      <div className="space-y-4">
        {steps.map((step) => (
          <FunnelChartRow key={step.stepName} step={step} />
        ))}
      </div>
    </section>
  );
}
