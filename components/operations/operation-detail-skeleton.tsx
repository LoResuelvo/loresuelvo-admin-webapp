import { translations } from "@/infrastructure/i18n/translations";

export interface OperationDetailSkeletonProps {
  className?: string;
}

function HeaderSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="space-y-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-[#1A2B48]/10 pb-4">
        <div className="flex gap-3">
          <div className="h-5 w-20 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-5 w-24 animate-pulse rounded bg-[#1A2B48]/10" />
        </div>
        <div className="h-6 w-24 animate-pulse rounded-full bg-[#1A2B48]/10" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-[#1A2B48]/10 p-4">
          <div className="size-11 animate-pulse rounded-full bg-[#1A2B48]/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-3 w-40 animate-pulse rounded bg-[#1A2B48]/5" />
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-[#1A2B48]/10 p-4">
          <div className="size-11 animate-pulse rounded-full bg-[#1A2B48]/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-3 w-40 animate-pulse rounded bg-[#1A2B48]/5" />
          </div>
        </div>
      </div>
      <div className="h-14 animate-pulse rounded-xl bg-[#F4F1EE]/60" />
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div data-testid="skeleton-indicator" className="space-y-6">
      <div className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs">
        <div className="h-5 w-44 animate-pulse rounded bg-[#1A2B48]/10" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-[#1A2B48]/5" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[#1A2B48]/5" />
        </div>
      </div>
      <div className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs">
        <div className="h-5 w-40 animate-pulse rounded bg-[#1A2B48]/10" />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="h-16 animate-pulse rounded-xl bg-[#F4F1EE]/60" />
          <div className="h-16 animate-pulse rounded-xl bg-[#F4F1EE]/60" />
        </div>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <div className="h-5 w-36 animate-pulse rounded bg-[#1A2B48]/10" />
      <div className="mt-6 space-y-6">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className="size-4 animate-pulse rounded-full bg-[#1A2B48]/15" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 animate-pulse rounded bg-[#1A2B48]/10" />
              <div className="h-3 w-28 animate-pulse rounded bg-[#1A2B48]/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OperationDetailSkeleton({ className = "" }: OperationDetailSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={translations.operations.loading}
      data-testid="operation-detail-skeleton"
      className={`space-y-6 ${className}`.trim()}
    >
      <HeaderSkeleton />
      <CardsSkeleton />
      <TimelineSkeleton />
      <span className="sr-only">{translations.operations.loading}</span>
    </div>
  );
}
