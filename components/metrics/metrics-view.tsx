import type { ConversionFunnel } from "@/domain/metrics/funnel";
import type { GetFunnelActionResult } from "@/app/(dashboard)/metricas/actions";
import { translations } from "@/infrastructure/i18n/translations";
import { FunnelOverviewCard } from "./funnel-overview-card";
import { FunnelChart } from "./funnel-chart";
import { FunnelStepCard } from "./funnel-step-card";

export interface MetricsViewProps {
  initialResult?: GetFunnelActionResult;
  data?: ConversionFunnel | null;
  error?: string | null;
  isForbidden?: boolean;
  onRetry?: () => void;
}

function MetricsAlertState({
  isForbidden,
  error,
  onRetry,
}: {
  isForbidden: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const t = translations.metrics;
  if (isForbidden) {
    return (
      <div
        role="alert"
        className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900"
      >
        <p className="font-semibold text-sm">{t.forbidden}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div
        role="alert"
        className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-3"
      >
        <p className="font-semibold text-sm">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-700 text-white hover:bg-red-800 transition-colors"
          >
            {t.retry}
          </button>
        ) : null}
      </div>
    );
  }
  return null;
}

function MetricsStepsGrid({
  steps,
  maxCount,
}: {
  steps: ConversionFunnel["steps"];
  maxCount: number;
}) {
  return (
    <section aria-label="Detalle de etapas del embudo" className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A2B48]">
        Etapas del Embudo y Conversión Relativa
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <FunnelStepCard
            key={step.stepName}
            step={step}
            index={index}
            totalSteps={steps.length}
            maxCount={maxCount}
          />
        ))}
      </div>
    </section>
  );
}

export function MetricsView({
  initialResult,
  data: propData,
  error: propError,
  isForbidden: propForbidden,
  onRetry,
}: MetricsViewProps) {
  const t = translations.metrics;
  const data = propData ?? (initialResult?.success ? initialResult.data : null);
  const error =
    propError ??
    (initialResult && !initialResult.success ? initialResult.error : null);
  const isForbidden =
    propForbidden ??
    (initialResult && !initialResult.success
      ? Boolean(initialResult.isForbidden)
      : false);

  if (isForbidden || error) {
    return (
      <MetricsAlertState
        isForbidden={isForbidden}
        error={error}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return null;
  }

  const maxCount =
    data.steps.length > 0 ? Math.max(...data.steps.map((s) => s.count), 1) : 1;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A2B48]">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-[#536176]">{t.subtitle}</p>
      </header>

      <FunnelOverviewCard
        globalConversionRate={data.globalConversionRate}
        initialCount={data.steps[0]?.count}
        finalCount={data.steps[data.steps.length - 1]?.count}
      />

      <FunnelChart steps={data.steps} />

      <MetricsStepsGrid steps={data.steps} maxCount={maxCount} />
    </div>
  );
}
