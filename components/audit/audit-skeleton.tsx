import { translations } from "@/infrastructure/i18n/translations";

export interface AuditSkeletonProps {
  className?: string;
}

function SkeletonFilters() {
  return (
    <div
      data-testid="audit-skeleton-filters"
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <div className="h-9 w-48 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-56 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-36 animate-pulse rounded-xl bg-[#1A2B48]/10" />
      <div className="h-9 w-36 animate-pulse rounded-xl bg-[#1A2B48]/10" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div
      data-testid="audit-skeleton-table"
      className="overflow-hidden rounded-2xl border border-[#1A2B48]/10 bg-white shadow-sm"
    >
      <div className="h-12 border-b border-[#1A2B48]/10 bg-[#1A2B48]/5" />
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
            <div className="h-4 w-28 rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-44 rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-32 rounded bg-[#1A2B48]/10" />
            <div className="h-4 w-36 rounded bg-[#1A2B48]/10" />
            <div className="h-4 flex-1 rounded bg-[#1A2B48]/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditSkeleton({ className = "" }: AuditSkeletonProps) {
  const copy = translations.audit;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-testid="audit-skeleton"
      className={`space-y-4 ${className}`.trim()}
    >
      <SkeletonFilters />
      <SkeletonTable />
      <span className="sr-only">{copy.loading}</span>
    </div>
  );
}
