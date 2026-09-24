import { translations } from "@/infrastructure/i18n/translations";

export interface ProviderDiagnosticSkeletonProps {
  className?: string;
}

function ProfileHeaderSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="flex flex-col gap-6 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="size-16 motion-safe:animate-pulse rounded-full bg-[#1A2B48]/10" />
        <div className="space-y-2">
          <div className="h-6 w-48 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
          <div className="h-4 w-32 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 sm:flex-col sm:items-end">
        <div className="h-4 w-36 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
        <div className="h-4 w-28 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
      </div>
    </div>
  );
}

function ConditionsPanelSkeleton() {
  return (
    <div data-testid="skeleton-indicator" className="space-y-4">
      <div className="h-5 w-48 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-[#1A2B48]/10 bg-white p-5 shadow-2xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 motion-safe:animate-pulse rounded bg-[#1A2B48]/10" />
                <div className="h-4 w-16 motion-safe:animate-pulse rounded-full bg-[#1A2B48]/10" />
              </div>
              <div className="h-4 w-28 motion-safe:animate-pulse rounded bg-[#1A2B48]/10" />
            </div>
            <div className="mt-4 h-3 w-20 motion-safe:animate-pulse rounded bg-[#1A2B48]/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitySummarySkeleton() {
  return (
    <div data-testid="skeleton-indicator" className="space-y-4">
      <div className="h-5 w-44 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#1A2B48]/10 bg-white p-5 shadow-2xs"
          >
            <div className="h-3 w-24 motion-safe:animate-pulse rounded bg-[#1A2B48]/10" />
            <div className="mt-2 h-7 w-12 motion-safe:animate-pulse rounded bg-[#1A2B48]/10" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#1A2B48]/10 bg-white p-6 shadow-2xs">
        <div className="h-4 w-36 motion-safe:animate-pulse rounded bg-[#1A2B48]/10" />
        <div className="mt-4 space-y-3">
          <div className="h-10 w-full motion-safe:animate-pulse rounded-lg bg-[#1A2B48]/5" />
          <div className="h-10 w-full motion-safe:animate-pulse rounded-lg bg-[#1A2B48]/5" />
        </div>
      </div>
    </div>
  );
}

export function ProviderDiagnosticSkeleton({
  className = "",
}: ProviderDiagnosticSkeletonProps) {
  const label =
    translations.users.diagnostic.skeletonLoading ??
    translations.users.diagnostic.loading;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="diagnostic-skeleton"
      className={`space-y-6 ${className}`.trim()}
    >
      <ProfileHeaderSkeleton />
      <ConditionsPanelSkeleton />
      <ActivitySummarySkeleton />
      <span className="sr-only">{label}</span>
    </div>
  );
}
