import { translations } from "@/infrastructure/i18n/translations";

export interface MetricsAlertStateProps {
  isForbidden: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function MetricsAlertState({
  isForbidden,
  error,
  onRetry,
}: MetricsAlertStateProps) {
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
