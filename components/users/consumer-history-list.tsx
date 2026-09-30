"use client";

import type {
  ConsumerHistoryItem,
  ConsumerHistoryPagination,
} from "@/domain/users/consumer-history";
import { translations } from "@/infrastructure/i18n/translations";
import { ConsumerHistoryFilters } from "./consumer-history-filters";
import { ConsumerHistoryTable } from "./consumer-history-table";

export interface ConsumerHistoryListProps {
  history: ConsumerHistoryItem[];
  selectedType?: string;
  selectedStatus?: string;
  pagination?: ConsumerHistoryPagination;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  preserveHistoryOnError?: boolean;
  error?: string | null;
  onTypeChange?: (type: string) => void;
  onStatusChange?: (status: string) => void;
  onLoadMore?: () => void;
  onRetry?: () => void;
}

function ConsumerHistoryEmpty() {
  const copy = translations.users.consumerDetail.history;

  return (
    <div
      role="status"
      className="p-12 text-center text-[#536176]"
    >
      <p className="text-base font-medium">{copy.empty}</p>
    </div>
  );
}

function ConsumerHistoryFilteredEmpty() {
  const copy = translations.users.consumerDetail.history;

  return (
    <div
      role="status"
      className="p-12 text-center text-[#536176]"
    >
      <p className="text-base font-medium">{copy.filters.emptyFiltered}</p>
    </div>
  );
}

export function ConsumerHistoryList({
  history,
  selectedType = "all",
  selectedStatus = "all",
  pagination,
  isLoading = false,
  isLoadingMore = false,
  preserveHistoryOnError = false,
  error,
  onTypeChange: onExternalTypeChange,
  onStatusChange: onExternalStatusChange,
  onLoadMore,
  onRetry,
}: ConsumerHistoryListProps) {
  const copy = translations.users.consumerDetail.history;
  const hasActiveFilters = selectedType !== "all" || selectedStatus !== "all";
  const showFilters = Boolean(onExternalTypeChange || onExternalStatusChange) ||
    history.length > 0 || hasActiveFilters;

  return (
    <section
      data-testid="consumer-history-list"
      aria-label={copy.title}
      className="rounded-2xl border border-[#1A2B48]/10 bg-white shadow-xs overflow-hidden"
    >
      <header className="flex flex-col gap-4 border-b border-[#1A2B48]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1A2B48]">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-[#536176]">{copy.subtitle}</p>
        </div>
        {showFilters && (
          <ConsumerHistoryFilters
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onTypeChange={onExternalTypeChange}
            onStatusChange={onExternalStatusChange}
          />
        )}
      </header>

      {error && (
        <div role="alert" className="p-6 text-center text-red-700">
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg bg-[#147560] px-4 py-2 text-sm font-medium text-white"
            >
              {copy.retry}
            </button>
          )}
        </div>
      )}

      {error && !preserveHistoryOnError ? null : isLoading && !isLoadingMore ? (
        <p role="status" aria-busy="true" className="p-6 text-center text-[#536176]">
          {copy.loading}
        </p>
      ) : history.length === 0 ? (
        hasActiveFilters ? <ConsumerHistoryFilteredEmpty /> : <ConsumerHistoryEmpty />
      ) : (
        <ConsumerHistoryTable history={history} />
      )}

      {pagination?.hasMore && !error && (
        <div className="border-t border-[#1A2B48]/10 p-4 text-center">
          {isLoadingMore && (
            <p role="status" aria-busy="true" className="mb-3 text-sm text-[#536176]">
              {copy.loadingMore}
            </p>
          )}
          <button
            type="button"
            onClick={onLoadMore}
            disabled={!onLoadMore || isLoadingMore || isLoading}
            className="rounded-lg border border-[#147560]/30 px-4 py-2 text-sm font-medium text-[#147560] disabled:cursor-wait disabled:opacity-60"
          >
            {copy.loadMore}
          </button>
        </div>
      )}
    </section>
  );
}
