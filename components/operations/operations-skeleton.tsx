import { translations } from "@/infrastructure/i18n/translations";

export interface OperationsSkeletonProps {
  rowCount?: number;
  className?: string;
}

export function OperationsSkeleton({ rowCount = 5, className = "" }: OperationsSkeletonProps) {
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div
      role="status"
      aria-label={translations.operations.loading}
      data-testid="operations-skeleton"
      className={`overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs ${className}`.trim()}
    >
      <div className="border-b border-[#1A2B48]/10 bg-[#F4F1EE]/50 px-6 py-4">
        <div className="flex gap-8">
          <div className="h-4 w-28 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-4 w-28 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-4 w-28 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-[#1A2B48]/10" />
        </div>
      </div>

      <div className="divide-y divide-[#1A2B48]/5">
        {rows.map((row) => (
          <div
            key={row}
            data-testid="skeleton-row"
            className="flex items-center gap-8 px-6 py-4"
          >
            <div className="w-36 space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-[#1A2B48]/10" />
              <div className="h-3 w-32 animate-pulse rounded bg-[#1A2B48]/5" />
            </div>
            <div className="w-36 space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-[#1A2B48]/10" />
              <div className="h-3 w-32 animate-pulse rounded bg-[#1A2B48]/5" />
            </div>
            <div className="w-24">
              <div className="h-4 w-16 animate-pulse rounded bg-[#1A2B48]/10" />
            </div>
            <div className="w-24">
              <div className="h-5 w-20 animate-pulse rounded-md bg-[#1A2B48]/10" />
            </div>
            <div className="w-36">
              <div className="h-5 w-28 animate-pulse rounded-full bg-[#1A2B48]/10" />
            </div>
            <div className="w-24">
              <div className="h-5 w-16 animate-pulse rounded-md bg-[#1A2B48]/10" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{translations.operations.loading}</span>
    </div>
  );
}
