import { translations } from "@/infrastructure/i18n/translations";

export interface ConsumerHistorySkeletonProps {
  className?: string;
}

function ConsumerProfileHeaderSkeleton() {
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

function ConsumerHistoryListSkeleton() {
  return (
    <div
      data-testid="skeleton-indicator"
      className="space-y-4 rounded-2xl border border-[#1A2B48]/10 bg-white p-6 shadow-2xs"
    >
      <div className="space-y-2">
        <div className="h-5 w-48 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
        <div className="h-4 w-72 motion-safe:animate-pulse rounded-md bg-[#1A2B48]/10" />
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <div className="h-10 w-44 motion-safe:animate-pulse rounded-lg bg-[#1A2B48]/5" />
        <div className="h-10 w-44 motion-safe:animate-pulse rounded-lg bg-[#1A2B48]/5" />
      </div>

      <div className="mt-4 space-y-3 pt-2">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className="h-12 w-full motion-safe:animate-pulse rounded-lg bg-[#1A2B48]/5"
          />
        ))}
      </div>
    </div>
  );
}

export function ConsumerHistorySkeleton({
  className = "",
}: ConsumerHistorySkeletonProps) {
  const label =
    translations.users.consumerDetail.skeletonLoading ??
    translations.users.consumerDetail.loading;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="consumer-skeleton"
      className={`space-y-6 ${className}`.trim()}
    >
      <ConsumerProfileHeaderSkeleton />
      <ConsumerHistoryListSkeleton />
      <span className="sr-only">{label}</span>
    </div>
  );
}
