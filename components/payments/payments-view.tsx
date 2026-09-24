"use client";

import { useMemo, useState } from "react";
import type { PaymentIntentSummary } from "./types";
import { translations } from "@/infrastructure/i18n/translations";
import { PaymentsTable } from "./payments-table";
import { PaymentsSkeleton } from "./payments-skeleton";
import { PaymentsFilters } from "./payments-filters";
import { filterPayments } from "./filter-payments";

export interface PaymentsViewProps {
  items: PaymentIntentSummary[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
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
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 space-y-3"
    >
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
    <div
      data-testid="payments-empty"
      className="rounded-xl border border-[#1A2B48]/10 bg-white p-8 text-center text-[#536176]"
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function PaymentsView({
  items,
  isLoading = false,
  error = null,
  onRetry,
  searchQuery: controlledSearchQuery,
  onSearchChange: controlledOnSearchChange,
  className = "",
}: PaymentsViewProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const searchQuery = controlledSearchQuery ?? localSearchQuery;
  const handleSearchChange = controlledOnSearchChange ?? setLocalSearchQuery;
  const copy = translations.payments;

  const filteredItems = useMemo(
    () => filterPayments(items, { query: searchQuery }),
    [items, searchQuery],
  );

  if (isLoading) {
    return <PaymentsSkeleton className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      <PaymentsHeader title={copy.title} subtitle={copy.subtitle} />

      {error ? (
        <PaymentsErrorAlert error={error} retryLabel={copy.retry} onRetry={onRetry} />
      ) : (
        <>
          <PaymentsFilters searchQuery={searchQuery} onSearchChange={handleSearchChange} />
          {filteredItems.length === 0 ? (
            <PaymentsEmptyState message={copy.empty} />
          ) : (
            <PaymentsTable items={filteredItems} />
          )}
        </>
      )}
    </div>
  );
}
