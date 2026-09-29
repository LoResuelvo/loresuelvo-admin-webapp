import { translations } from "@/infrastructure/i18n/translations";

export interface ModerationSkeletonProps {
  className?: string;
}

function SkeletonTabs() {
  return (
    <div
      data-testid="moderation-skeleton-tabs"
      className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm"
    >
      <div className="h-9 w-24 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-28 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-28 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-24 animate-pulse rounded-xl bg-[#1A2B48]/10" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div
      data-testid="moderation-skeleton-table"
      className="overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-sm"
    >
      <div className="h-12 border-b border-[#1A2B48]/10 bg-[#1A2B48]/5" />
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
            <div className="h-4 w-28 rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-36 rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-16 rounded bg-[#1A2B48]/10" />
            <div className="h-4 flex-1 rounded bg-[#1A2B48]/5" />
            <div className="h-4 w-32 rounded bg-[#1A2B48]/10" />
            <div className="h-8 w-24 rounded-lg bg-[#1A2B48]/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModerationSkeleton({ className = "" }: ModerationSkeletonProps = {}) {
  const label = translations.moderation.loadingComments;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="moderation-skeleton"
      className={`space-y-4 ${className}`.trim()}
    >
      <SkeletonTabs />
      <SkeletonTable />
      <span className="sr-only">{label}</span>
    </div>
  );
}
