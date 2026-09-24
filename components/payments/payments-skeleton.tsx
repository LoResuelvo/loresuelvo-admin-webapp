import { translations } from "@/infrastructure/i18n/translations";

export interface PaymentsSkeletonProps {
  className?: string;
}

export function PaymentsSkeleton({ className = "" }: PaymentsSkeletonProps) {
  const copy = translations.payments;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-testid="payments-skeleton"
      className={`space-y-6 ${className}`.trim()}
    >
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-[#1A2B48]/10" />
        <div className="h-4 w-96 animate-pulse rounded bg-[#1A2B48]/5" />
      </div>

      <div
        data-testid="skeleton-indicator"
        className="overflow-hidden rounded-xl border border-[#1A2B48]/10 bg-white p-6 shadow-sm space-y-4"
      >
        <div className="flex justify-between border-b border-[#1A2B48]/10 pb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 w-20 animate-pulse rounded bg-[#1A2B48]/10" />
          ))}
        </div>
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="flex justify-between items-center py-3 border-b border-[#1A2B48]/5">
            <div className="h-4 w-24 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-[#1A2B48]/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-20 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-[#1A2B48]/10" />
          </div>
        ))}
      </div>
      <span className="sr-only">{copy.loading}</span>
    </div>
  );
}
