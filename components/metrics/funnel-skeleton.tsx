import { translations } from "@/infrastructure/i18n/translations";

export interface FunnelSkeletonProps {
  className?: string;
}

function SkeletonHeader() {
  return (
    <header className="space-y-2">
      <div className="h-7 w-64 animate-pulse rounded-lg bg-[#1A2B48]/10" />
      <div className="h-4 w-96 animate-pulse rounded bg-[#1A2B48]/5" />
    </header>
  );
}

function SkeletonFilters() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <div className="h-9 w-40 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-40 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-32 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-32 animate-pulse rounded-xl bg-[#1A2B48]/10" />
    </div>
  );
}

function SkeletonCards() {
  return (
    <>
      <div
        data-testid="skeleton-indicator"
        className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-sm space-y-4"
      >
        <div className="h-5 w-48 animate-pulse rounded bg-[#1A2B48]/10" />
        <div className="h-10 w-24 animate-pulse rounded bg-[#1A2B48]/10" />
      </div>
      <div
        data-testid="skeleton-indicator"
        className="rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-sm space-y-4"
      >
        <div className="h-5 w-36 animate-pulse rounded bg-[#1A2B48]/10" />
        <div className="h-48 w-full animate-pulse rounded-xl bg-[#1A2B48]/5" />
      </div>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3"
        >
          <div className="h-4 w-28 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-8 w-16 animate-pulse rounded bg-[#1A2B48]/10" />
          <div className="h-3 w-32 animate-pulse rounded bg-[#1A2B48]/5" />
        </div>
      ))}
    </div>
  );
}

export function FunnelSkeleton({ className = "" }: FunnelSkeletonProps) {
  const copy = translations.metrics;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-testid="metrics-skeleton"
      className={`space-y-6 ${className}`.trim()}
    >
      <SkeletonHeader />
      <SkeletonFilters />
      <SkeletonCards />
      <SkeletonGrid />
      <span className="sr-only">{copy.loading}</span>
    </div>
  );
}
