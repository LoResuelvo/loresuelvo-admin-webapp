import Link from "next/link";
import type { ProviderActivitySummary as ProviderActivitySummaryData } from "@/domain/users/provider-diagnostic";
import { translations } from "@/infrastructure/i18n/translations";
import { ROUTES } from "@/lib/routes";

export interface ProviderActivitySummaryProps {
  activitySummary?: ProviderActivitySummaryData;
}

const STATUS_STYLES: Record<string, string> = {
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  quoted: "bg-purple-50 text-purple-700 border-purple-200",
};

function formatOperationDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

function MetricCard({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string | number;
  secondary?: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#1A2B48]/10 bg-white p-5 shadow-2xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#1A2B48]/60">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#1A2B48]">
          {value}
        </span>
        {secondary && (
          <span className="text-xs font-medium text-[#536176]">{secondary}</span>
        )}
      </div>
    </div>
  );
}

function OperationListItem({
  op,
  copy,
}: {
  op: ProviderActivitySummaryData["recentOperations"][number];
  copy: typeof translations.users.diagnostic.activity.recentOperations;
}) {
  const statusClass =
    STATUS_STYLES[op.status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const statusLabel =
    (copy.statuses as Record<string, string>)[op.status] ?? op.status;

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#1A2B48]">
            {op.consumerName}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-[#536176]">
            {op.categoryName}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>
        <p className="mt-1 text-xs text-[#536176]">
          {copy.date}: {formatOperationDate(op.createdAt)}
        </p>
      </div>

      <div className="flex items-center sm:self-center">
        <Link
          href={ROUTES.operationDetail(op.id)}
          className="inline-flex items-center rounded-lg border border-[#147560]/30 bg-white px-3 py-1.5 text-xs font-medium text-[#147560] transition-colors hover:bg-[#147560]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147560]"
        >
          {copy.viewDetail}
        </Link>
      </div>
    </li>
  );
}

function RecentOperationsList({
  operations,
}: {
  operations: ProviderActivitySummaryData["recentOperations"];
}) {
  const copy = translations.users.diagnostic.activity.recentOperations;

  if (operations.length === 0) {
    return (
      <div className="rounded-xl border border-[#1A2B48]/10 bg-gray-50/50 p-6 text-center text-sm text-[#536176]">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1A2B48]/10 bg-white shadow-2xs">
      <ul className="divide-y divide-[#1A2B48]/5" aria-label={copy.title}>
        {operations.map((op) => (
          <OperationListItem key={op.id} op={op} copy={copy} />
        ))}
      </ul>
    </div>
  );
}

function ActivityMetricsGrid({
  summary,
  copy,
}: {
  summary: ProviderActivitySummaryData;
  copy: typeof translations.users.diagnostic.activity;
}) {
  const {
    totalRequests,
    activeOrders,
    completedOrders,
    averageRating,
    reviewsCount,
  } = summary;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label={copy.metrics.totalRequests} value={totalRequests} />
      <MetricCard label={copy.metrics.activeOrders} value={activeOrders} />
      <MetricCard label={copy.metrics.completedOrders} value={completedOrders} />
      <MetricCard
        label={copy.metrics.averageRating}
        value={averageRating > 0 ? averageRating.toFixed(1) : "—"}
        secondary={
          reviewsCount > 0
            ? `(${reviewsCount} ${copy.metrics.reviewsCount})`
            : undefined
        }
      />
    </div>
  );
}

function EmptyActivitySummary({
  copy,
}: {
  copy: typeof translations.users.diagnostic.activity;
}) {
  return (
    <section
      data-testid="provider-activity-summary"
      aria-labelledby="activity-summary-title"
      className="rounded-xl border border-[#1A2B48]/10 bg-white p-6 shadow-2xs"
    >
      <h2
        id="activity-summary-title"
        className="text-lg font-semibold tracking-tight text-[#1A2B48]"
      >
        {copy.title}
      </h2>
      <p className="mt-2 text-sm text-[#536176]">{copy.empty}</p>
    </section>
  );
}

export function ProviderActivitySummary({
  activitySummary,
}: ProviderActivitySummaryProps) {
  const copy = translations.users.diagnostic.activity;

  if (!activitySummary) {
    return <EmptyActivitySummary copy={copy} />;
  }

  return (
    <section
      data-testid="provider-activity-summary"
      aria-labelledby="activity-summary-title"
      className="space-y-4"
    >
      <div>
        <h2
          id="activity-summary-title"
          className="text-lg font-semibold tracking-tight text-[#1A2B48]"
        >
          {copy.title}
        </h2>
        <p className="text-sm text-[#536176]">{copy.subtitle}</p>
      </div>

      <ActivityMetricsGrid summary={activitySummary} copy={copy} />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight text-[#1A2B48]">
          {copy.recentOperations.title}
        </h3>
        <RecentOperationsList operations={activitySummary.recentOperations} />
      </div>
    </section>
  );
}
