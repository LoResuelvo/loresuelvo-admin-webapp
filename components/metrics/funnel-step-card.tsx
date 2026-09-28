import type { FunnelStepData } from "./types";
import { formatDurationMinutes, formatPercentage } from "./formatters";
import { translations } from "@/infrastructure/i18n/translations";

export interface FunnelStepCardProps {
  step: FunnelStepData;
  index: number;
  totalSteps: number;
  maxCount: number;
}

function StepMetricsFooter({
  step,
  isFirstStep,
}: {
  step: FunnelStepData;
  isFirstStep: boolean;
}) {
  const t = translations.metrics;
  return (
    <div className="mt-4 pt-4 border-t border-[#1A2B48]/10 grid grid-cols-2 gap-3 text-xs">
      <div>
        <span className="block text-[#536176] mb-0.5">{t.relativeRetention}</span>
        <span
          data-testid={`retention-${step.stepName}`}
          className="font-semibold text-sm text-[#1A2B48]"
        >
          {isFirstStep ? "100%" : formatPercentage(step.relativeConversion)}
        </span>
      </div>
      <div>
        <span className="block text-[#536176] mb-0.5">{t.averageDuration}</span>
        <span
          data-testid={`duration-${step.stepName}`}
          className="font-semibold text-sm text-[#1A2B48]"
        >
          {formatDurationMinutes(step.avgDurationMinutes)}
        </span>
      </div>
    </div>
  );
}

export function FunnelStepCard({
  step,
  index,
  totalSteps,
  maxCount,
}: FunnelStepCardProps) {
  const t = translations.metrics;
  const isFirstStep = index === 0;
  const progressPercent =
    maxCount > 0 ? Math.min(100, Math.round((step.count / maxCount) * 100)) : 0;

  return (
    <article
      data-testid={`funnel-step-${step.stepName}`}
      className="p-5 rounded-2xl bg-white border border-[#1A2B48]/10 shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#147560] bg-[#147560]/10 px-2.5 py-1 rounded-full">
            {t.stepIndex} {index + 1} {t.stepOf} {totalSteps}
          </span>
          <span className="text-xs text-[#536176] font-medium">
            {progressPercent}% del inicial
          </span>
        </div>

        <h3 className="text-base font-semibold text-[#1A2B48] mt-1">
          {step.label}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-[#1A2B48]">
            {step.count.toLocaleString("es-AR")}
          </span>
          <span className="text-xs text-[#536176]">
            operaciones
          </span>
        </div>

        <div className="w-full bg-[#F4F1EE] rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-[#147560] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${step.label}: ${progressPercent}%`}
          />
        </div>
      </div>

      <StepMetricsFooter step={step} isFirstStep={isFirstStep} />
    </article>
  );
}
