"use client";

import type { PaymentIntentSummary, PaymentPurpose, PaymentStatus } from "./types";
import type { PaymentSearchField } from "./payments-filters";
import { translations } from "@/infrastructure/i18n/translations";
import { PaymentsTable } from "./payments-table";
import { PaymentsSkeleton } from "./payments-skeleton";
import { PaymentsFilters } from "./payments-filters";

export interface PaymentsViewProps {
  items: PaymentIntentSummary[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasNextPage?: boolean;
  error?: string | null;
  isForbidden?: boolean;
  searchField: PaymentSearchField;
  onSearchFieldChange: (field: PaymentSearchField) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  searchError?: string | null;
  selectedPurpose: PaymentPurpose | "";
  onPurposeChange: (purpose: PaymentPurpose | "") => void;
  selectedStatus: PaymentStatus | "";
  onStatusChange: (status: PaymentStatus | "") => void;
  onRetry?: () => void;
  onLoadMore?: () => void;
  className?: string;
}

function PaymentsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#1A2B48]">{title}</h1>
      <p className="mt-1 text-sm text-[#536176]">{subtitle}</p>
    </div>
  );
}

function PaymentsForbiddenAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function PaymentsErrorAlert({
  error,
  retryLabel,
  onRetry,
}: {
  error: string;
  retryLabel: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 space-y-3">
      <p className="text-sm">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

function PaymentsEmptyState({ message }: { message: string }) {
  return (
    <div data-testid="payments-empty" className="rounded-xl border border-[#1A2B48]/10 bg-white p-8 text-center text-[#536176]">
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function PaymentsView({
  items,
  isLoading = false,
  isLoadingMore = false,
  hasNextPage = false,
  error = null,
  isForbidden = false,
  searchField,
  onSearchFieldChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchError,
  selectedPurpose,
  onPurposeChange,
  selectedStatus,
  onStatusChange,
  onRetry,
  onLoadMore,
  className = "",
}: PaymentsViewProps) {
  const copy = translations.payments;

  if (isLoading) {
    return <PaymentsSkeleton className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <PaymentsHeader title={copy.title} subtitle={copy.subtitle} />

      {isForbidden ? (
        <PaymentsForbiddenAlert message={copy.forbidden} />
      ) : error ? (
        <PaymentsErrorAlert error={error} retryLabel={copy.retry} onRetry={onRetry} />
      ) : (
        <>
          <PaymentsFilters
            searchField={searchField}
            onSearchFieldChange={onSearchFieldChange}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
            searchError={searchError}
            selectedPurpose={selectedPurpose}
            onPurposeChange={onPurposeChange}
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
          />
          {items.length === 0 ? <PaymentsEmptyState message={copy.empty} /> : <PaymentsTable items={items} />}
          {hasNextPage && onLoadMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="rounded-xl border border-[#147560] px-4 py-2.5 text-sm font-medium text-[#147560] hover:bg-[#147560]/5 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoadingMore ? copy.loadingMore : copy.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
