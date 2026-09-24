import type { PaymentIntentSummary } from "./types";
import { translations } from "@/infrastructure/i18n/translations";
import { PaymentsTable } from "./payments-table";
import { PaymentsSkeleton } from "./payments-skeleton";

export interface PaymentsViewProps {
  items: PaymentIntentSummary[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function PaymentsView({
  items,
  isLoading = false,
  error = null,
  onRetry,
  className = "",
}: PaymentsViewProps) {
  const copy = translations.payments;

  if (isLoading) {
    return <PaymentsSkeleton className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-[#536176]">
          {copy.subtitle}
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 space-y-3"
        >
          <p className="text-sm">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              {copy.retry}
            </button>
          )}
        </div>
      ) : items.length === 0 ? (
        <div
          data-testid="payments-empty"
          className="rounded-xl border border-[#1A2B48]/10 bg-white p-8 text-center text-[#536176]"
        >
          <p className="text-sm">{copy.empty}</p>
        </div>
      ) : (
        <PaymentsTable items={items} />
      )}
    </div>
  );
}
