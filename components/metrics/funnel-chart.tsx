import type { FunnelStepData } from "./types";
import { formatDurationMinutes, formatPercentage } from "./formatters";

export interface FunnelChartProps {
  steps: FunnelStepData[];
}

export function FunnelChart({ steps }: FunnelChartProps) {
  const maxCount = steps.length > 0 ? Math.max(...steps.map((s) => s.count), 1) : 1;

  return (
    <section
      aria-label="Gráfico de embudo operativo"
      className="p-6 rounded-2xl bg-white border border-[#1A2B48]/10 shadow-sm"
    >
      <h2 className="text-base font-semibold text-[#1A2B48] mb-4">
        Flujo de Conversión por Etapa
      </h2>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const widthPercent = Math.max(8, Math.round((step.count / maxCount) * 100));
          return (
            <div
              key={step.stepName}
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
                    ({idx === 0 ? "100%" : `${formatPercentage(step.relativeConversion)} ret.`})
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
                  className="bg-gradient-to-r from-[#147560] to-[#1A2B48] h-full rounded-md transition-all duration-300 flex items-center px-2 text-[11px] font-semibold text-white justify-end"
                  style={{ width: `${widthPercent}%` }}
                >
                  {widthPercent >= 20 ? `${widthPercent}%` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
