import { translations } from "@/infrastructure/i18n/translations";

export interface ClaimDetailSkeletonProps {
  className?: string;
}

function HeaderSkeleton() {
  return (
    <div data-testid="skeleton-indicator" className="space-y-4 border-b border-[#1A2B48]/10 pb-4">
      <div className="h-4 w-32 animate-pulse rounded bg-[#1A2B48]/10" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-64 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-4 w-48 animate-pulse rounded bg-[#1A2B48]/5" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-[#1A2B48]/10" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-[#1A2B48]/10" />
        </div>
      </div>
    </div>
  );
}

function PartiesSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <div className="h-5 w-40 animate-pulse rounded bg-[#1A2B48]/10" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#1A2B48]/10 bg-[#F4F1EE]/20 p-3.5 space-y-2"
          >
            <div className="h-3 w-16 animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-28 animate-pulse rounded bg-[#1A2B48]/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConflictSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs space-y-3"
    >
      <div className="h-5 w-56 animate-pulse rounded bg-[#1A2B48]/10" />
      <div className="h-20 animate-pulse rounded-xl bg-[#F4F1EE]/40" />
    </div>
  );
}

function EvidenceSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-[#1A2B48]/10 pb-4">
        <div className="h-5 w-44 animate-pulse rounded bg-[#1A2B48]/10" />
        <div className="h-4 w-12 animate-pulse rounded bg-[#1A2B48]/10" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[0, 1].map((idx) => (
          <div
            key={idx}
            className="aspect-4/3 animate-pulse rounded-xl bg-[#F4F1EE]/50"
          />
        ))}
      </div>
    </div>
  );
}

function OperationLinkSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-xs"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-4 w-64 animate-pulse rounded bg-[#1A2B48]/5" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      </div>
    </div>
  );
}

export function ClaimDetailSkeleton({ className = "" }: ClaimDetailSkeletonProps) {
  const copy = translations.claims.detail;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-testid="claim-detail-skeleton"
      className={`space-y-6 ${className}`.trim()}
    >
      <HeaderSkeleton />
      <PartiesSkeleton />
      <ConflictSkeleton />
      <EvidenceSkeleton />
      <OperationLinkSkeleton />
      <span className="sr-only">{copy.loading}</span>
    </div>
  );
}
