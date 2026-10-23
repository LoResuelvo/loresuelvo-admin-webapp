import type { FunnelStepData } from "./types";
import { formatDurationMinutes, formatPercentage } from "./formatters";
import { translations } from "@/infrastructure/i18n/translations";

export interface FunnelStepCardProps {
  step: FunnelStepData;
  index: number;
  totalSteps: number;
}

function StepMetricsFooter({
  step,
}: {
  step: FunnelStepData;
}) {
  const t = translations.metrics;
  const previousStep = step.conversionFromPrevious;
  const previousStepRate = previousStep
    ? previousStep.rate === null
      ? `${t.unavailable} (${previousStep.numerator} de ${previousStep.denominator})`
      : `${formatPercentage(previousStep.rate)} (${previousStep.numerator} de ${previousStep.denominator})`
    : t.unavailable;

  return (
    <div className="mt-4 pt-4 border-t border-[#1A2B48]/10 grid grid-cols-2 gap-3 text-xs">
      <div>
        <span className="block text-[#536176] mb-0.5">{t.relativeRetention}</span>
        <span
          data-testid={`retention-${step.stepName}`}
          className="font-semibold text-sm text-[#1A2B48]"
        >
          {previousStepRate}
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
        {step.delayObservations !== undefined &&
        step.delayObservations !== null &&
        step.avgDurationMinutes !== null ? (
          <span
            data-testid={`delay-observations-${step.stepName}`}
            className="block text-[11px] text-[#536176]"
          >
            {step.delayObservations}{" "}
            {step.delayObservations === 1
              ? t.delays.observationSingular
              : t.delays.observationPlural}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function FunnelStepCard({
  step,
  index,
  totalSteps,
}: FunnelStepCardProps) {
  const t = translations.metrics;
  const progressPercent = step.count === 0
    ? 0
    : Math.min(100, Math.round((step.conversionFromStart ?? 0) * 100));

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
            {step.conversionFromStart === null
              ? t.unavailable
              : `${formatPercentage(step.conversionFromStart)} ${t.fromInitialBase}`}
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
            {t.volume}
          </span>
        </div>

        <div className="w-full bg-[#F4F1EE] rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-[#147560] h-2 rounded-full transition-all duration-300"
            data-testid={`funnel-step-progress-${step.stepName}`}
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${step.label}: ${step.conversionFromStart === null ? t.unavailable : `${formatPercentage(step.conversionFromStart)} ${t.fromInitialBase}`}`}
          />
        </div>
      </div>

      <StepMetricsFooter step={step} />
    </article>
  );
}
